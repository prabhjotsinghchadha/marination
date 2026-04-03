import { and, asc, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";

import { requireStaffApi } from "@/libs/adminStaff";
import { db } from "@/libs/DB";
import { buildEventDetailsFromCreateRequest, normalizeOptionalImageUrl } from "@/libs/marketEventDetails";
import { marketCpmmBinaryState, marketEvents, marketOutcomes, markets } from "@/models/Schema";

import type { EventDetails, EventVisualMode } from "@/product/sections/event/types";

const EVENT_TYPE_MARKET_CREATED = "MARKET_CREATED";
const USDC_DECIMALS = 6;

const UpdateDraftSchema = z
  .object({
    question: z.string().min(1),
    description: z.string().optional().nullable(),
    slug: z.string().min(1),
    startTime: z.string().optional().nullable(),
    endTime: z.string().min(1),
    yesLabel: z.string().min(1),
    noLabel: z.string().min(1),
    visualMode: z.enum(["single", "comparison"]),
    heroImageUrl: z.string().max(2048).optional().nullable(),
    yesImageUrl: z.string().max(2048).optional().nullable(),
    noImageUrl: z.string().max(2048).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.visualMode === "single") {
      if (!normalizeOptionalImageUrl(data.heroImageUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid https hero image URL is required for single-proposition markets",
          path: ["heroImageUrl"],
        });
      }
    } else {
      if (!normalizeOptionalImageUrl(data.yesImageUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid https YES image URL is required for head-to-head markets",
          path: ["yesImageUrl"],
        });
      }
      if (!normalizeOptionalImageUrl(data.noImageUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid https NO image URL is required for head-to-head markets",
          path: ["noImageUrl"],
        });
      }
    }
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
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
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

  const [evRow] = await db
    .select({ payload: marketEvents.payload })
    .from(marketEvents)
    .where(and(eq(marketEvents.marketId, id), eq(marketEvents.eventType, EVENT_TYPE_MARKET_CREATED)))
    .orderBy(asc(marketEvents.createdAt))
    .limit(1);

  let yesImageUrl = "";
  let noImageUrl = "";
  let visualMode: EventVisualMode = "single";
  let heroImageUrl = "";
  if (evRow?.payload != null && typeof evRow.payload === "object") {
    const payload = evRow.payload as EventDetails;
    const yesOpt = payload.options?.find((o) => o.id === "yes");
    const noOpt = payload.options?.find((o) => o.id === "no");
    yesImageUrl = yesOpt?.imageUrl ?? "";
    noImageUrl = noOpt?.imageUrl ?? "";
    heroImageUrl = payload.heroImageUrl ?? "";
    if (payload.visualMode === "single" || payload.visualMode === "comparison") {
      visualMode = payload.visualMode;
    } else if (payload.heroImageUrl) {
      visualMode = "single";
    } else if (yesOpt?.imageUrl && noOpt?.imageUrl) {
      visualMode = "comparison";
    } else {
      visualMode = "single";
    }
  }

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
      visualMode,
      heroImageUrl,
      yesImageUrl,
      noImageUrl,
    },
  });
};

/**
 * Publishes a draft market (`action: "publish"`) or updates draft copy/outcome labels.
 */
export const PATCH = async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }

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
    visualMode: body.visualMode,
    heroImageUrl: body.heroImageUrl,
    yesImageUrl: body.yesImageUrl,
    noImageUrl: body.noImageUrl,
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
