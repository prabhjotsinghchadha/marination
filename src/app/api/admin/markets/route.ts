import { count, desc, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/libs/DB";
import {
  marketCpmmBinaryState,
  marketOutcomes,
  marketResolutions,
  markets,
  trades,
} from "@/models/Schema";

import type { AdminMarket, AdminMarketStatus, AdminResolvedOutcome } from "@/product/sections/admin-dashboard/types";

const USDC_DECIMALS = 6;

const STATUSES: AdminMarketStatus[] = ["DRAFT", "OPEN", "CLOSED", "RESOLVED"];

function parseStatus(raw: string): AdminMarketStatus {
  return STATUSES.includes(raw as AdminMarketStatus) ? (raw as AdminMarketStatus) : "DRAFT";
}

function atomicToUsd(n: bigint | null | undefined): number {
  if (n === null || n === undefined) return 0;
  return Number(n) / 10 ** USDC_DECIMALS;
}

function parseResolvedOutcome(key: string | null | undefined): AdminResolvedOutcome | undefined {
  if (key === "YES" || key === "NO") return key;
  return undefined;
}

/**
 * Lists markets for the admin dashboard (Neon-backed).
 */
export const GET = async () => {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tradeRows = await db
    .select({ marketId: trades.marketId, c: count() })
    .from(trades)
    .groupBy(trades.marketId);

  const tradeCountByMarket = new Map<string, number>();
  for (const row of tradeRows) {
    tradeCountByMarket.set(row.marketId, Number(row.c));
  }

  const rows = await db
    .select({
      id: markets.id,
      question: markets.question,
      slug: markets.slug,
      status: markets.status,
      model: markets.model,
      endTime: markets.endTime,
      createdAt: markets.createdAt,
      yesPoolAmount: marketCpmmBinaryState.yesPoolAmount,
      noPoolAmount: marketCpmmBinaryState.noPoolAmount,
      volumeCollateralAmount: marketCpmmBinaryState.volumeCollateralAmount,
      resolvedOutcomeKey: marketOutcomes.outcomeKey,
    })
    .from(markets)
    .leftJoin(marketCpmmBinaryState, eq(markets.id, marketCpmmBinaryState.marketId))
    .leftJoin(marketResolutions, eq(markets.id, marketResolutions.marketId))
    .leftJoin(marketOutcomes, eq(marketResolutions.resolvedOutcomeId, marketOutcomes.id))
    .orderBy(desc(markets.createdAt));

  const payload: AdminMarket[] = rows.map((r) => {
    const resolvedOutcome = parseResolvedOutcome(r.resolvedOutcomeKey);
    const base: AdminMarket = {
      id: r.id,
      question: r.question,
      slug: r.slug,
      status: parseStatus(r.status),
      model: "CPMM_BINARY",
      volume: atomicToUsd(r.volumeCollateralAmount),
      yesPool: atomicToUsd(r.yesPoolAmount),
      noPool: atomicToUsd(r.noPoolAmount),
      trades: tradeCountByMarket.get(r.id) ?? 0,
      endTime: r.endTime ? r.endTime.toISOString().slice(0, 10) : "—",
      createdAt: r.createdAt.toISOString().slice(0, 10),
      ...(resolvedOutcome !== undefined ? { resolvedOutcome } : {}),
    };
    return base;
  });

  return NextResponse.json({ markets: payload });
};
