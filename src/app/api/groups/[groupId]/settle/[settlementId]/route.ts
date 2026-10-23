import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settlements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, unauthorized, forbidden, requireGroupMember } from "@/lib/auth-guard";

type Params = { params: { groupId: string; settlementId: string } };

// DELETE /api/groups/[groupId]/settle/[settlementId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id!);
  if (!member) return forbidden();

  const [settlement] = await db
    .select()
    .from(settlements)
    .where(and(eq(settlements.id, params.settlementId), eq(settlements.groupId, params.groupId)))
    .limit(1);
  if (!settlement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(settlements).where(eq(settlements.id, params.settlementId));

  return new NextResponse(null, { status: 204 });
}
