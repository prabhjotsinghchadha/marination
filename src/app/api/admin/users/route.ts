import { count, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { parseUserRole, requireStaffApi } from "@/libs/adminStaff";
import { db } from "@/libs/DB";
import { trades, userCollateralBalances, users } from "@/models/Schema";

import type { AdminAuthProvider, AdminUser, AdminUsersViewer } from "@/product/sections/admin-dashboard/types";

const USDC_DECIMALS = 6;

function atomicToUsd(n: bigint): number {
  return Number(n) / 10 ** USDC_DECIMALS;
}

function parseAuthProvider(raw: string): AdminAuthProvider {
  const lower = raw.toLowerCase();
  if (lower === "google" || lower === "twitter" || lower === "apple" || lower === "clerk") {
    return lower;
  }
  return "clerk";
}

/**
 * Lists users for the admin dashboard with balances and trade counts.
 */
export const GET = async () => {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }

  const viewerRole = parseUserRole(gate.ctx.dbUser.role);
  const viewer: AdminUsersViewer = {
    id: gate.ctx.dbUser.id,
    role: viewerRole,
    canAssignRoles: viewerRole === "admin",
  };

  const userRows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      authProvider: users.authProvider,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const tradeRows = await db
    .select({ userId: trades.userId, c: count() })
    .from(trades)
    .groupBy(trades.userId);

  const tradeCountByUser = new Map<string, number>();
  for (const row of tradeRows) {
    tradeCountByUser.set(row.userId, Number(row.c));
  }

  const balanceRows = await db
    .select({
      userId: userCollateralBalances.userId,
      available: sql<string>`coalesce(sum(${userCollateralBalances.availableAmount}), 0)::text`,
      reserved: sql<string>`coalesce(sum(${userCollateralBalances.reservedAmount}), 0)::text`,
    })
    .from(userCollateralBalances)
    .groupBy(userCollateralBalances.userId);

  const balanceByUser = new Map<string, { available: bigint; reserved: bigint }>();
  for (const row of balanceRows) {
    balanceByUser.set(row.userId, {
      available: BigInt(row.available),
      reserved: BigInt(row.reserved),
    });
  }

  const payload: AdminUser[] = userRows.map((row) => {
    const bal = balanceByUser.get(row.id);
    const available = bal?.available ?? BigInt(0);
    const reserved = bal?.reserved ?? BigInt(0);

    return {
      id: row.id,
      displayName: row.displayName,
      email: row.email ?? "—",
      authProvider: parseAuthProvider(row.authProvider),
      role: parseUserRole(row.role),
      balance: atomicToUsd(available),
      reserved: atomicToUsd(reserved),
      trades: tradeCountByUser.get(row.id) ?? 0,
      createdAt: row.createdAt.toISOString().slice(0, 10),
    };
  });

  return NextResponse.json({ users: payload, viewer });
};
