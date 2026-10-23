import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Groups" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rows = await db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, session.user.id));

  const myGroups = rows.map((r) => r.group);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Your groups</h1>
        <Button asChild href="/groups/new" size="sm">New group</Button>
      </div>

      {myGroups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3" aria-hidden="true">🧾</p>
          <p className="font-medium text-gray-900">No groups yet</p>
          <p className="mt-1 text-sm text-gray-500 mb-4">
            Create a group for a trip, flat, or any shared expense.
          </p>
          <Button asChild href="/groups/new">Create your first group</Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3" role="list">
          {myGroups.map((g) => (
            <li key={g.id}>
              <Link href={`/groups/${g.id}`} className="block">
                <Card className="p-4 hover:border-brand/30 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{g.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{g.currency}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
