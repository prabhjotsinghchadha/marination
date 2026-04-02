import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/libs/DB";
import { logger } from "@/libs/Logger";
import { syncClerkUserFromClerkUser } from "@/libs/ClerkUserSync";
import { createMarket, getMarketAtomicState } from "@/libs/amm";
import { assets, marketCpmmBinaryState, marketEvents, marketOutcomes, markets, users } from "@/models/Schema";

import type { EventDetails } from "@/product/sections/event/types";

const EVENT_TYPE_MARKET_CREATED = "MARKET_CREATED";

const CreateMarketRequestSchema = z.object({
  question: z.string().min(1),
  description: z.string().optional().nullable(),
  slug: z.string().min(1),

  model: z.literal("CPMM_BINARY").optional().default("CPMM_BINARY"),
  collateralAsset: z.literal("USDC").optional().default("USDC"),

  startTime: z.string().optional().nullable(),
  endTime: z.string().min(1),

  feeBps: z.number().int().min(0).max(9999),
  initialLiquidity: z.number().positive(),

  // UI inputs for human-friendly outcome labels.
  yesLabel: z.string().optional().default("YES"),
  noLabel: z.string().optional().default("NO"),
});

type CreateMarketRequestBody = z.infer<typeof CreateMarketRequestSchema>;

function buildEventDetailsFromCreateRequest(props: {
  slug: string;
  question: string;
  description: string | null | undefined;
  endTime: string;
  initialLiquidity: number;
  yesLabel: string;
  noLabel: string;
}): EventDetails {
  // The Event screen expects a full `EventDetails` object.
  const endDate = new Date(props.endTime);
  const endTimeText = Number.isNaN(endDate.getTime()) ? "end time" : endDate.toUTCString();

  const yesProbability = 50;
  const noProbability = 50;
  const yesPriceCents = 50;
  const noPriceCents = 50;

  return {
    slug: props.slug,
    category: "Music prediction market",
    title: props.question,
    summary: props.description ?? props.question,
    notes: props.description ?? "",
    rules: [],
    timelineAndPayout: `The market closes at ${endTimeText}. Winning "${props.yesLabel}" settles at $1.00 and losing "${props.noLabel}" settles at $0.00.`,
    prohibitions: "",
    options: [
      {
        id: "drake",
        name: props.yesLabel,
        probability: yesProbability,
        yesPriceCents,
        noPriceCents,
        avatarLabel: "YES",
        avatarStartColor: "#F7941D",
        avatarEndColor: "#FFD16F",
      },
      {
        id: "kendrick",
        name: props.noLabel,
        probability: noProbability,
        yesPriceCents: yesPriceCents,
        noPriceCents: noPriceCents,
        avatarLabel: "NO",
        avatarStartColor: "#6D28D9",
        avatarEndColor: "#C4B5FD",
      },
    ],
    chart: {
      labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "D-0"],
      yTicks: [60, 50, 40, 30, 20],
      volumeLabel: `$${props.initialLiquidity.toFixed(0)} liquidity`,
      series: [
        {
          id: "drake",
          label: props.yesLabel,
          color: "#FFAE42",
          points: [50, 50, 50, 50, 50, 50, 50],
        },
        {
          id: "kendrick",
          label: props.noLabel,
          color: "#F2F2F7",
          points: [50, 50, 50, 50, 50, 50, 50],
        },
      ],
    },
    relatedMarkets: [],
    comments: [],
  };
}

export const POST = async (request: Request) => {
  const json = await request.json();
  const parse = CreateMarketRequestSchema.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Ensure the Clerk user row exists in Neon before we reference it.
  await syncClerkUserFromClerkUser(user);

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authSubject, user.id),
    columns: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "User not found in database" }, { status: 500 });
  }

  const body: CreateMarketRequestBody = parse.data;

  const existing = await db.query.markets.findFirst({
    where: eq(markets.slug, body.slug),
    columns: { id: true },
  });

  if (existing) {
    return NextResponse.json({ message: "Market slug already exists" }, { status: 409 });
  }

  const eventDetails = buildEventDetailsFromCreateRequest({
    slug: body.slug,
    question: body.question,
    description: body.description ?? null,
    endTime: body.endTime,
    initialLiquidity: body.initialLiquidity,
    yesLabel: body.yesLabel,
    noLabel: body.noLabel,
  });

  const yesOption = eventDetails.options[0]!;
  const noOption = eventDetails.options[1]!;

  let collateralAsset = await db.query.assets.findFirst({
    where: eq(assets.symbol, body.collateralAsset),
    columns: { id: true },
  });

  if (!collateralAsset) {
    const insertedAssets = await db
      .insert(assets)
      .values({
        symbol: body.collateralAsset,
        name: "USD Coin",
        decimals: 6,
        chain: "ethereum",
        contractAddress: undefined,
      })
      .returning();

    const newCollateralAsset = insertedAssets[0];
    if (!newCollateralAsset) {
      return NextResponse.json(
        { message: "Failed to seed USDC asset row" },
        { status: 500 },
      );
    }

    collateralAsset = newCollateralAsset;
  }

  const startTime = body.startTime ? new Date(body.startTime) : undefined;
  const endTime = new Date(body.endTime);

  const perSideLiquidity = body.initialLiquidity / 2;
  const fee = body.feeBps / 10_000;

  const initialMarket = createMarket({ initialLiquidity: perSideLiquidity, fee });
  const atomic = getMarketAtomicState(initialMarket);

  const createdMarkets = await db
    .insert(markets)
    .values({
      creatorUserId: dbUser.id,
      collateralAssetId: collateralAsset.id,

      status: "DRAFT",
      model: body.model,
      question: body.question,
      description: body.description ?? undefined,
      slug: body.slug,
      startTime,
      endTime,
    })
    .returning();

  const createdMarket = createdMarkets[0]!;

  const yesOutcome = await db
    .insert(marketOutcomes)
    .values({
      marketId: createdMarket.id,
      outcomeKey: "YES",
      label: yesOption.name || body.yesLabel,
      sortOrder: 0,
      payoutNumerator: BigInt(1),
      payoutDenominator: BigInt(1),
    })
    .returning();

  const noOutcome = await db
    .insert(marketOutcomes)
    .values({
      marketId: createdMarket.id,
      outcomeKey: "NO",
      label: noOption.name || body.noLabel,
      sortOrder: 1,
      payoutNumerator: BigInt(0),
      payoutDenominator: BigInt(1),
    })
    .returning();

  const yesOutcomeRow = yesOutcome[0]!;
  const noOutcomeRow = noOutcome[0]!;

  await db.insert(marketCpmmBinaryState).values({
    marketId: createdMarket.id,
    yesOutcomeId: yesOutcomeRow.id,
    noOutcomeId: noOutcomeRow.id,

    feeBps: Number(atomic.feeBps),
    yesPoolAmount: atomic.yesPool,
    noPoolAmount: atomic.noPool,
    feePoolAmount: atomic.feePool,
    k: atomic.k,
    volumeCollateralAmount: atomic.volume,
    clock: atomic.clock,
  });

  await db.insert(marketEvents).values({
    marketId: createdMarket.id,
    eventType: EVENT_TYPE_MARKET_CREATED,
    actorUserId: dbUser.id,
    payload: eventDetails,
  });

  logger.info("Market created in Neon", {
    marketId: createdMarket.id,
    slug: createdMarket.slug,
  });

  return NextResponse.json({
    ok: true,
    marketId: createdMarket.id,
    slug: createdMarket.slug,
  });
};

