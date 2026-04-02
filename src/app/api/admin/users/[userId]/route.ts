import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";

import { parseUserRole, requireAdminApi, type UserRole } from "@/libs/adminStaff";
import { db } from "@/libs/DB";
import { users } from "@/models/Schema";

const PatchBodySchema = z.object({
  role: z.enum(["admin", "moderator", "user"]),
});

/**
 * Updates a user's platform role. Only `admin` may call this.
 */
export const PATCH = async (request: Request, context: { params: Promise<{ userId: string }> }) => {
  const gate = await requireAdminApi();
  if (!gate.ok) {
    return gate.response;
  }

  const { userId } = await context.params;
  const json = await request.json();
  const parsed = PatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 422 });
  }

  const newRole: UserRole = parsed.data.role;

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true, authSubject: true },
  });

  if (!target) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const previousRole = parseUserRole(target.role);

  if (previousRole === "admin" && newRole !== "admin") {
    const adminCountRows = await db
      .select({ c: count() })
      .from(users)
      .where(eq(users.role, "admin"));
    const adminTotal = adminCountRows[0]?.c ?? 0;
    if (Number(adminTotal) <= 1) {
      return NextResponse.json({ message: "Cannot remove the last admin" }, { status: 409 });
    }
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

  return NextResponse.json({ ok: true, role: newRole });
};
