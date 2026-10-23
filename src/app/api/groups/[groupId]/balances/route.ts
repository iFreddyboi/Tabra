import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, expenseSplits, groupMembers, settlements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, unauthorized, forbidden, requireGroupMember } from "@/lib/auth-guard";
import { computeBalances, simplifyDebts } from "@/lib/balances";

// GET /api/groups/[groupId]/balances
// Returns per-member net balances and the minimum set of transfers.
export async function GET(
  _req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const member = await requireGroupMember(params.groupId, session.user.id);
  if (!member) return forbidden();

  const [members, expenseRows, settlementRows] = await Promise.all([
    db.select().from(groupMembers).where(eq(groupMembers.groupId, params.groupId)),
    db
      .select({
        id: expenses.id,
        paidBy: expenses.paidBy,
        amount: expenses.amount,
        splits: expenseSplits,
      })
      .from(expenses)
      .leftJoin(expenseSplits, eq(expenseSplits.expenseId, expenses.id))
      .where(eq(expenses.groupId, params.groupId)),
    db.select().from(settlements).where(eq(settlements.groupId, params.groupId)),
  ]);

  // Group splits by expense
  const expenseMap = new Map<string, { paidBy: string; splits: { memberId: string; amount: string }[] }>();
  for (const row of expenseRows) {
    if (!expenseMap.has(row.id)) {
      expenseMap.set(row.id, { paidBy: row.paidBy, splits: [] });
    }
    if (row.splits?.memberId) {
      expenseMap.get(row.id)!.splits.push({
        memberId: row.splits.memberId,
        amount: row.splits.amount,
      });
    }
  }

  const balances = computeBalances(
    members.map((m) => ({ id: m.id, name: m.name })),
    Array.from(expenseMap.values()),
    settlementRows.map((s) => ({
      fromMember: s.fromMember,
      toMember: s.toMember,
      amount: s.amount,
    }))
  );

  const transfers = simplifyDebts(balances);

  return NextResponse.json({ balances, transfers });
}
