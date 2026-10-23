import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groups, groupMembers, expenses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { AddExpenseModal } from "./add-expense-modal";
import { ExpenseActions } from "./expense-actions";
import { InviteButton } from "./invite-button";

export const metadata: Metadata = { title: "Group" };

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const [group] = await db.select().from(groups).where(eq(groups.id, params.groupId)).limit(1);
  if (!group) notFound();

  const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, group.id));
  const isMember = members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect("/dashboard");

  const expenseRows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.groupId, group.id))
    .orderBy(desc(expenses.date));

  const myMember = members.find((m) => m.userId === session.user.id)!;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ← Groups
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">{group.name}</h1>
          <p className="text-sm text-gray-400">{group.currency} · {members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <InviteButton groupId={group.id} token={group.inviteToken} />
          <Button asChild href={`/groups/${group.id}/balances`} variant="secondary" size="sm">
            Balances
          </Button>
        </div>
      </div>

      {/* Members row */}
      <div className="flex gap-2 mb-6 flex-wrap" aria-label="Group members">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-surface text-brand text-xs font-medium"
          >
            {m.userId ? (
              <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[10px]">
                {m.name[0]?.toUpperCase()}
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px]" title="Guest">
                G
              </span>
            )}
            {m.name}
          </span>
        ))}
      </div>

      {/* Expenses */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Expenses</h2>
        <AddExpenseModal groupId={group.id} members={members} myMemberId={myMember.id} currency={group.currency} />
      </div>

      {expenseRows.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-3xl mb-3" aria-hidden="true">🧾</p>
            <p className="font-medium text-gray-900">No expenses yet</p>
            <p className="mt-1 text-sm text-gray-500">Add the first one above.</p>
          </CardBody>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {expenseRows.map((exp) => {
            const paidByMember = members.find((m) => m.id === exp.paidBy);
            return (
              <li key={exp.id}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{exp.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {exp.date} · paid by {paidByMember?.name ?? "someone"}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 tabular-nums flex-shrink-0">
                      {exp.currency} {Number(exp.amount).toFixed(2)}
                    </p>
                  </div>
                  <ExpenseActions
                    expense={{ id: exp.id, description: exp.description, amount: exp.amount, currency: exp.currency, paidBy: exp.paidBy, date: exp.date }}
                    groupId={group.id}
                    members={members}
                    currency={group.currency}
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
