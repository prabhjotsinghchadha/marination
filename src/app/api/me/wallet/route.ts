import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/libs/DB";
import { syncClerkUserFromClerkUser } from "@/libs/ClerkUserSync";
import { userCollateralBalances, users } from "@/models/Schema";

const USDC_DECIMALS = 6;

function atomicToUsd(n: bigint): number {
  return Number(n) / 10 ** USDC_DECIMALS;
}

/**
 * Returns total USDC collateral (available + reserved) for the signed-in user.
 */
export const GET = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await syncClerkUserFromClerkUser(clerkUser);

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authSubject, clerkUser.id),
    columns: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ totalUsd: 0 });
  }

  const rows = await db
    .select({
      total: sql<string>`coalesce(sum(${userCollateralBalances.availableAmount} + ${userCollateralBalances.reservedAmount}), 0)::text`,
    })
    .from(userCollateralBalances)
    .where(eq(userCollateralBalances.userId, dbUser.id));

  const totalAtomic = BigInt(rows[0]?.total ?? "0");
  const totalUsd = atomicToUsd(totalAtomic);

  return NextResponse.json({ totalUsd });
};
