import { and, asc, eq, ne } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/libs/DB";
import { syncClerkUserFromClerkUser } from "@/libs/ClerkUserSync";
import { buildEventDetailsFromCreateRequest } from "@/libs/marketEventDetails";
import { marketCpmmBinaryState, marketEvents, marketOutcomes, markets } from "@/models/Schema";

const EVENT_TYPE_MARKET_CREATED = "MARKET_CREATED";
const USDC_DECIMALS = 6;

const UpdateDraftSchema = z.object({
  question: z.string().min(1),
  description: z.string().optional().nullable(),
  slug: z.string().min(1),
  startTime: z.string().optional().nullable(),
  endTime: z.string().min(1),
  yesLabel: z.string().min(1),
  noLabel: z.string().min(1),
});

function atomicPoolsToInitialLiquidityUsd(yesPool: bigint | null | undefined, noPool: bigint | null | undefined): number {
  const y = yesPool ?? BigInt(0);
  const n = noPool ?? BigInt(0);
  return Number(y + n) / 10 ** USDC_DECIMALS;
}

/**
 * Returns one market for admin edit (draft details + pool-derived liquidity).
 */
export const GET = async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const row = await db.query.markets.findFirst({
    where: eq(markets.id, id),
    columns: {
      id: true,
      question: true,
      description: true,
      slug: true,
      status: true,
      startTime: true,
      endTime: true,
    },
  });

  if (!row) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  const cpmm = await db.query.marketCpmmBinaryState.findFirst({
    where: eq(marketCpmmBinaryState.marketId, id),
    columns: {
      feeBps: true,
      yesPoolAmount: true,
      noPoolAmount: true,
    },
  });

  const outcomes = await db
    .select({ outcomeKey: marketOutcomes.outcomeKey, label: marketOutcomes.label })
    .from(marketOutcomes)
    .where(eq(marketOutcomes.marketId, id));

  const yesRow = outcomes.find((o) => o.outcomeKey === "YES");
  const noRow = outcomes.find((o) => o.outcomeKey === "NO");

  const initialLiquidity = atomicPoolsToInitialLiquidityUsd(cpmm?.yesPoolAmount, cpmm?.noPoolAmount);

  return NextResponse.json({
    market: {
      id: row.id,
      question: row.question,
      description: row.description ?? null,
      slug: row.slug,
      status: row.status,
      startTime: row.startTime ? row.startTime.toISOString() : null,
      endTime: row.endTime ? row.endTime.toISOString() : "",
      feeBps: cpmm?.feeBps ?? 0,
      initialLiquidity,
      yesLabel: yesRow?.label ?? "Yes",
      noLabel: noRow?.label ?? "No",
    },
  });
};

/**
 * Publishes a draft market (`action: "publish"`) or updates draft copy/outcome labels.
 */
export const PATCH = async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await syncClerkUserFromClerkUser(user);

  const { id } = await context.params;
  const json = await request.json();

  if (json && typeof json === "object" && "action" in json && json.action === "publish") {
    const marketRow = await db.query.markets.findFirst({
      where: eq(markets.id, id),
      columns: { id: true, status: true },
    });

    if (!marketRow) {
      return NextResponse.json({ message: "Market not found" }, { status: 404 });
    }

    if (marketRow.status !== "DRAFT") {
      return NextResponse.json({ message: "Only draft markets can be published" }, { status: 409 });
    }

    await db.update(markets).set({ status: "OPEN" }).where(and(eq(markets.id, id), eq(markets.status, "DRAFT")));

    return NextResponse.json({ ok: true });
  }

  const parse = UpdateDraftSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const body = parse.data;

  const marketRow = await db.query.markets.findFirst({
    where: eq(markets.id, id),
    columns: {
      id: true,
      status: true,
      slug: true,
    },
  });

  if (!marketRow) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  if (marketRow.status !== "DRAFT") {
    return NextResponse.json({ message: "Only draft markets can be edited" }, { status: 409 });
  }

  if (body.slug !== marketRow.slug) {
    const dup = await db.query.markets.findFirst({
      where: and(eq(markets.slug, body.slug), ne(markets.id, id)),
      columns: { id: true },
    });
    if (dup) {
      return NextResponse.json({ message: "Market slug already exists" }, { status: 409 });
    }
  }

  const startTime = body.startTime ? new Date(body.startTime) : undefined;
  const endTime = new Date(body.endTime);

  const cpmm = await db.query.marketCpmmBinaryState.findFirst({
    where: eq(marketCpmmBinaryState.marketId, id),
    columns: {
      yesPoolAmount: true,
      noPoolAmount: true,
    },
  });

  const initialLiquidity = atomicPoolsToInitialLiquidityUsd(cpmm?.yesPoolAmount, cpmm?.noPoolAmount);

  await db
    .update(markets)
    .set({
      question: body.question,
      description: body.description ?? undefined,
      slug: body.slug,
      startTime,
      endTime,
    })
    .where(eq(markets.id, id));

  await db
    .update(marketOutcomes)
    .set({ label: body.yesLabel })
    .where(and(eq(marketOutcomes.marketId, id), eq(marketOutcomes.outcomeKey, "YES")));

  await db
    .update(marketOutcomes)
    .set({ label: body.noLabel })
    .where(and(eq(marketOutcomes.marketId, id), eq(marketOutcomes.outcomeKey, "NO")));

  const payload = buildEventDetailsFromCreateRequest({
    slug: body.slug,
    question: body.question,
    description: body.description ?? null,
    endTime: body.endTime,
    initialLiquidity,
    yesLabel: body.yesLabel,
    noLabel: body.noLabel,
  });

  const [ev] = await db
    .select({ id: marketEvents.id })
    .from(marketEvents)
    .where(and(eq(marketEvents.marketId, id), eq(marketEvents.eventType, EVENT_TYPE_MARKET_CREATED)))
    .orderBy(asc(marketEvents.createdAt))
    .limit(1);

  if (ev) {
    await db.update(marketEvents).set({ payload }).where(eq(marketEvents.id, ev.id));
  }

  return NextResponse.json({ ok: true });
};
