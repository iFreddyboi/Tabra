import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { settlements } from "@/db/schema";
import { requireAuth, unauthorized, forbidden, requireGroupMember } from "@/lib/auth-guard";

const SettleSchema = z.object({
  fromMember: z.string().uuid(),
  toMember: z.string().uuid(),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3).default("USD"),
  note: z.string().max(255).optional(),
});

// POST /api/groups/[groupId]/settle — record a manual settlement
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id);
  if (!member) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = SettleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { fromMember, toMember, amount, currency, note } = parsed.data;

  const [settlement] = await db
    .insert(settlements)
    .values({
      groupId: params.groupId,
      fromMember,
      toMember,
      amount: String(amount),
      currency,
      note,
    })
    .returning();

  return NextResponse.json(settlement, { status: 201 });
}
