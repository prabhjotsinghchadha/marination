import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { syncClerkUserFromClerkUser } from '@/libs/ClerkUserSync';
import { USER_ROLES, users } from '@/models/Schema';

export type UserRole = (typeof USER_ROLES)[number];

export function parseUserRole(raw: string | null | undefined): UserRole {
  if (raw === 'admin' || raw === 'moderator' || raw === 'user') {
    return raw;
  }
  return 'user';
}

/** Staff may open the admin dashboard and call admin APIs (read/write except role assignment). */
export function roleIsStaff(role: UserRole): boolean {
  return role === 'admin' || role === 'moderator';
}

export type StaffApiContext = {
  clerkAuthSubject: string;
  dbUser: InferSelectModel<typeof users>;
};

/**
 * Ensures the caller is signed in, synced to Neon, and has staff (`admin` or `moderator`) role.
 */
export async function requireStaffApi(): Promise<
  { ok: true; ctx: StaffApiContext } | { ok: false; response: NextResponse }
> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { ok: false, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  await syncClerkUserFromClerkUser(clerkUser);

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authSubject, clerkUser.id),
  });

  if (!dbUser) {
    return { ok: false, response: NextResponse.json({ message: 'User not found' }, { status: 500 }) };
  }

  const role = parseUserRole(dbUser.role);
  if (!roleIsStaff(role)) {
    return { ok: false, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, ctx: { clerkAuthSubject: clerkUser.id, dbUser } };
}

/**
 * Ensures the caller is staff and has `admin` role (e.g. assign roles to other users).
 */
export async function requireAdminApi(): Promise<
  { ok: true; ctx: StaffApiContext } | { ok: false; response: NextResponse }
> {
  const staff = await requireStaffApi();
  if (!staff.ok) {
    return staff;
  }
  if (parseUserRole(staff.ctx.dbUser.role) !== 'admin') {
    return { ok: false, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return staff;
}
