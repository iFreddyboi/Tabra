import type { Metadata } from "next";
import { JoinForm } from "./join-form";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Join group" };

export default async function JoinPage({ params }: { params: { token: string } }) {
  const [group] = await db
    .select({ id: groups.id, name: groups.name, currency: groups.currency })
    .from(groups)
    .where(eq(groups.inviteToken, params.token))
    .limit(1);

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🔗</p>
          <h1 className="text-lg font-semibold text-gray-900">Invite link not found</h1>
          <p className="mt-2 text-sm text-gray-500">This link may have expired or the group was deleted.</p>
        </div>
      </div>
    );
  }

  const members = await db
    .select({ name: groupMembers.name })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, group.id));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-brand">Tabra</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-lg font-semibold text-gray-900">{group.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {members.length > 0 && ` · ${members.slice(0, 3).map((m) => m.name).join(", ")}${members.length > 3 ? ` +${members.length - 3} more` : ""}`}
          </p>
          <div className="mt-5">
            <JoinForm groupId={group.id} token={params.token} />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          No account needed. You can create one later.
        </p>
      </div>
    </div>
  );
}
