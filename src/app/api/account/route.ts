import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, accounts, sessions, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, unauthorized } from "@/lib/auth-guard";

// DELETE /api/account — hard delete; Apple requires this for apps with sign-up.
export async function DELETE() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const userId = session.user.id!;

  // Nullify group memberships (keeps group history intact for other members)
  // rather than cascade-deleting expenses they paid for.
  await db
    .update(groupMembers)
    .set({ userId: null })
    .where(eq(groupMembers.userId, userId));

  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  return new NextResponse(null, { status: 204 });
}
