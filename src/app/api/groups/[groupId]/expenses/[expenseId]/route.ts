import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { expenses, expenseSplits } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, unauthorized, forbidden, requireGroupMember } from "@/lib/auth-guard";
import { computeSplits } from "@/lib/splits";

const UpdateExpenseSchema = z.object({
  description: z.string().min(1).max(255).trim().optional(),
  amount: z.number().positive().multipleOf(0.01).optional(),
  paidBy: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  split: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("equal"), memberIds: z.array(z.string().uuid()) }),
    z.object({
      mode: z.literal("exact"),
      memberIds: z.array(z.string().uuid()),
      perMember: z.record(z.string().uuid(), z.number().positive()),
    }),
    z.object({
      mode: z.literal("percentage"),
      memberIds: z.array(z.string().uuid()),
      perMember: z.record(z.string().uuid(), z.number().positive()),
    }),
    z.object({
      mode: z.literal("shares"),
      memberIds: z.array(z.string().uuid()),
      perMember: z.record(z.string().uuid(), z.number().positive()),
    }),
  ]).optional(),
});

type Params = { params: { groupId: string; expenseId: string } };

// PATCH /api/groups/[groupId]/expenses/[expenseId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id!);
  if (!member) return forbidden();

  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, params.expenseId), eq(expenses.groupId, params.groupId)))
    .limit(1);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { description, amount, paidBy, date, split } = parsed.data;
  const newAmount = amount ?? Number(expense.amount);

  const updates: Partial<typeof expense> = {};
  if (description !== undefined) updates.description = description;
  if (amount !== undefined) updates.amount = String(amount);
  if (paidBy !== undefined) updates.paidBy = paidBy;
  if (date !== undefined) updates.date = date;

  const [updated] = await db
    .update(expenses)
    .set(updates)
    .where(eq(expenses.id, params.expenseId))
    .returning();

  if (split) {
    let splitAmounts: Record<string, number>;
    try {
      splitAmounts = computeSplits({
        mode: split.mode,
        total: newAmount,
        memberIds: split.memberIds,
        perMember: "perMember" in split ? split.perMember : undefined,
      });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid split" },
        { status: 422 }
      );
    }

    await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, params.expenseId));
    await db.insert(expenseSplits).values(
      Object.entries(splitAmounts).map(([memberId, amt]) => ({
        expenseId: params.expenseId,
        memberId,
        amount: String(amt),
      }))
    );
  }

  return NextResponse.json(updated);
}

// DELETE /api/groups/[groupId]/expenses/[expenseId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id!);
  if (!member) return forbidden();

  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, params.expenseId), eq(expenses.groupId, params.groupId)))
    .limit(1);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, params.expenseId));
  await db.delete(expenses).where(eq(expenses.id, params.expenseId));

  return new NextResponse(null, { status: 204 });
}
