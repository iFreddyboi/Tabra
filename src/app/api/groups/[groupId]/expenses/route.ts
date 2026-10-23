import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { expenses, expenseSplits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, unauthorized, forbidden, requireGroupMember } from "@/lib/auth-guard";
import { computeSplits } from "@/lib/splits";

const SplitSchema = z.discriminatedUnion("mode", [
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
]);

const CreateExpenseSchema = z.object({
  description: z.string().min(1).max(255).trim(),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3).default("USD"),
  paidBy: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  split: SplitSchema,
});

// GET /api/groups/[groupId]/expenses
export async function GET(
  _req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id);
  if (!member) return forbidden();

  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.groupId, params.groupId))
    .orderBy(expenses.date);

  return NextResponse.json(rows);
}

// POST /api/groups/[groupId]/expenses
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id);
  if (!member) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = CreateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { description, amount, currency, paidBy, date, split } = parsed.data;

  let splitAmounts: Record<string, number>;
  try {
    splitAmounts = computeSplits({
      mode: split.mode,
      total: amount,
      memberIds: split.memberIds,
      perMember: "perMember" in split ? split.perMember : undefined,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid split" },
      { status: 422 }
    );
  }

  const [expense] = await db
    .insert(expenses)
    .values({
      groupId: params.groupId,
      paidBy,
      description,
      amount: String(amount),
      currency,
      date: date ?? new Date().toISOString().slice(0, 10),
    })
    .returning();

  const splitRows = Object.entries(splitAmounts).map(([memberId, amt]) => ({
    expenseId: expense.id,
    memberId,
    amount: String(amt),
  }));

  await db.insert(expenseSplits).values(splitRows);

  return NextResponse.json({ ...expense, splits: splitRows }, { status: 201 });
}
