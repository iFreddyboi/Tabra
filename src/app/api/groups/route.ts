import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { randomBytes } from "crypto";

const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  currency: z.string().length(3).default("USD"),
});

// GET /api/groups — list groups the current user belongs to
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const rows = await db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, session.user.id));

  return NextResponse.json(rows.map((r) => r.group));
}

// POST /api/groups — create a group and add the creator as the first member
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, currency } = parsed.data;
  const inviteToken = randomBytes(16).toString("hex");
  const displayName = session.user.name ?? session.user.email?.split("@")[0] ?? "You";

  const [group] = await db
    .insert(groups)
    .values({ name, currency, createdBy: session.user.id, inviteToken })
    .returning();

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: session.user.id,
    name: displayName,
    email: session.user.email ?? undefined,
  });

  return NextResponse.json(group, { status: 201 });
}
