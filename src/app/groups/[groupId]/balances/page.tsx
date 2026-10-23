import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { groups, groupMembers, expenses, expenseSplits, settlements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { computeBalances, simplifyDebts } from "@/lib/balances";
import { RecordSettlementButton } from "./record-settlement-button";
import { SettlementList } from "./settlement-list";

export const metadata: Metadata = { title: "Balances" };

export default async function BalancesPage({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const [group] = await db.select().from(groups).where(eq(groups.id, params.groupId)).limit(1);
  if (!group) notFound();

  const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, group.id));
  if (!members.some((m) => m.userId === session.user.id)) redirect("/dashboard");

  const [expenseRows, settlementRows] = await Promise.all([
    db
      .select({ id: expenses.id, paidBy: expenses.paidBy, amount: expenses.amount, splits: expenseSplits })
      .from(expenses)
      .leftJoin(expenseSplits, eq(expenseSplits.expenseId, expenses.id))
      .where(eq(expenses.groupId, group.id)),
    db.select().from(settlements).where(eq(settlements.groupId, group.id)),
  ]);

  const expenseMap = new Map<string, { paidBy: string; splits: { memberId: string; amount: string }[] }>();
  for (const row of expenseRows) {
    if (!expenseMap.has(row.id)) expenseMap.set(row.id, { paidBy: row.paidBy, splits: [] });
    if (row.splits?.memberId) {
      expenseMap.get(row.id)!.splits.push({ memberId: row.splits.memberId, amount: row.splits.amount });
    }
  }

  const balances = computeBalances(
    members.map((m) => ({ id: m.id, name: m.name })),
    Array.from(expenseMap.values()),
    settlementRows.map((s) => ({ fromMember: s.fromMember, toMember: s.toMember, amount: s.amount }))
  );
  const transfers = simplifyDebts(balances);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";

  return (
    <AppShell>
      <div className="mb-6">
        <Link href={`/groups/${group.id}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← {group.name}
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Balances</h1>
      </div>

      {/* Per-member net positions */}
      <section aria-label="Member balances" className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Who's owed what</h2>
        {balances.every((b) => b.net === 0) ? (
          <Card>
            <CardBody className="text-center py-10">
              <p className="text-3xl mb-2" aria-hidden="true">🎉</p>
              <p className="font-medium text-gray-900">All settled up</p>
              <p className="text-sm text-gray-500 mt-1">Nobody owes anything.</p>
            </CardBody>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {balances.map((b) => (
              <li key={b.memberId}>
                <Card className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{b.name}</span>
                    <span className={`font-semibold tabular-nums text-sm ${b.net > 0 ? "text-green-600" : b.net < 0 ? "text-red-500" : "text-gray-400"}`}>
                      {b.net > 0 ? "+" : ""}{group.currency} {Math.abs(b.net).toFixed(2)}
                    </span>
                  </div>
                  {b.net !== 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.net > 0 ? "is owed" : "owes"} {group.currency} {Math.abs(b.net).toFixed(2)}
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Minimum transfers */}
      {transfers.length > 0 && (
        <section aria-label="Suggested payments" className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Settle with {transfers.length} payment{transfers.length !== 1 ? "s" : ""}
          </h2>
          <ul className="flex flex-col gap-2" role="list">
            {transfers.map((t, i) => (
              <li key={i}>
                <Card className="px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{memberName(t.from)}</span>
                      <span className="text-gray-400 mx-1.5">→</span>
                      <span className="font-medium">{memberName(t.to)}</span>
                    </p>
                    <p className="font-semibold text-gray-900 tabular-nums text-sm flex-shrink-0">
                      {group.currency} {t.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`tez://upi/pay?pn=${encodeURIComponent(memberName(t.to))}&am=${t.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(group.name)}`}
                      className="text-xs text-brand underline hover:text-brand-dark"
                    >
                      Pay via GPay
                    </a>
                    <span className="text-gray-200">·</span>
                    <a
                      href={`phonepe://pay?pn=${encodeURIComponent(memberName(t.to))}&am=${t.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(group.name)}`}
                      className="text-xs text-brand underline hover:text-brand-dark"
                    >
                      Pay via PhonePe
                    </a>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recorded payments list with delete */}
      <SettlementList
        groupId={group.id}
        settlements={settlementRows}
        memberNames={Object.fromEntries(members.map((m) => [m.id, m.name]))}
        currency={group.currency}
      />

      {/* Record settlement — only meaningful with 2+ members */}
      {members.length >= 2 && (
        <RecordSettlementButton groupId={group.id} members={members} currency={group.currency} />
      )}
    </AppShell>
  );
}
