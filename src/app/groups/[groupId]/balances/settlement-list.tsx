"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Settlement {
  id: string;
  fromMember: string;
  toMember: string;
  amount: string;
  note: string | null;
  settledAt: Date;
}

interface Props {
  groupId: string;
  settlements: Settlement[];
  memberNames: Record<string, string>;
  currency: string;
}

export function SettlementList({ groupId, settlements, memberNames, currency }: Props) {
  const memberName = (id: string) => memberNames[id] ?? "Someone";
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/groups/${groupId}/settle/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmId(null);
    router.refresh();
  }

  if (settlements.length === 0) return null;

  return (
    <section aria-label="Recorded payments" className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recorded payments</h2>
      <ul className="flex flex-col gap-2" role="list">
        {settlements.map((s) => (
          <li key={s.id}>
            <Card className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{memberName(s.fromMember)}</span>
                    <span className="text-gray-400 mx-1.5">paid</span>
                    <span className="font-medium">{memberName(s.toMember)}</span>
                  </p>
                  {s.note && <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>}
                </div>
                <p className="font-semibold text-gray-900 tabular-nums text-sm flex-shrink-0">
                  {currency} {Number(s.amount).toFixed(2)}
                </p>
              </div>
              {confirmId === s.id ? (
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-gray-500 flex-1">Remove this payment?</p>
                  <Button size="sm" variant="danger" loading={deletingId === s.id} onClick={() => handleDelete(s.id)}>Remove</Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmId(null)}>Cancel</Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(s.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                >
                  Delete
                </button>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
