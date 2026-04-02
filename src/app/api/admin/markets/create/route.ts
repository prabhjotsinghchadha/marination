import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/libs/DB";
import { syncClerkUserFromClerkUser } from "@/libs/ClerkUserSync";
import { createMarket, getMarketAtomicState } from "@/libs/amm";
import { buildEventDetailsFromCreateRequest } from "@/libs/marketEventDetails";
import { assets, marketCpmmBinaryState, marketEvents, marketOutcomes, markets, users } from "@/models/Schema";

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

  return NextResponse.json({
    ok: true,
    marketId: createdMarket.id,
    slug: createdMarket.slug,
  });
};

