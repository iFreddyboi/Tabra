import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

const JoinSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
});

// GET /api/groups/join/[token] — preview group info for the join page (no auth required)
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const [group] = await db
    .select({ id: groups.id, name: groups.name, currency: groups.currency })
    .from(groups)
    .where(eq(groups.inviteToken, params.token))
    .limit(1);

  if (!group) {
    return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
  }

  const members = await db
    .select({ name: groupMembers.name })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, group.id));

  return NextResponse.json({ group, members });
}

// POST /api/groups/join/[token] — join a group as a guest (no account required)
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const [group] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.inviteToken, params.token))
    .limit(1);

  if (!group) {
    return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email } = parsed.data;

  // Guests join without a userId — userId stays NULL
  const [member] = await db
    .insert(groupMembers)
    .values({ groupId: group.id, name, email })
    .returning();

  return NextResponse.json({ member, groupId: group.id }, { status: 201 });
}
