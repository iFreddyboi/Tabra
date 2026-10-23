"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Member = { id: string; name: string; userId: string | null };
type SplitMode = "equal" | "exact" | "percentage" | "shares";

interface Expense {
  id: string;
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  date: string;
}

interface Props {
  expense: Expense;
  groupId: string;
  members: Member[];
  currency: string;
}

export function ExpenseActions({ expense, groupId, members, currency }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "edit" | "confirm-delete">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit form state
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(Number(expense.amount).toFixed(2)));
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [date, setDate] = useState(expense.date);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map((m) => m.id));
  const [perMember, setPerMember] = useState<Record<string, string>>({});

  function toggleMember(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!description.trim()) { setError("Description is required"); return; }
    if (!amount || isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return; }
    if (selectedIds.length === 0) { setError("Select at least one member"); return; }

    const splitPayload =
      splitMode === "equal"
        ? { mode: "equal", memberIds: selectedIds }
        : {
            mode: splitMode,
            memberIds: selectedIds,
            perMember: Object.fromEntries(
              selectedIds.map((id) => [id, parseFloat(perMember[id] ?? "0")])
            ),
          };

    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/expenses/${expense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim(), amount: amt, paidBy, date, split: splitPayload }),
    });

    if (res.ok) {
      setMode("idle");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(typeof body?.error === "string" ? body.error : "Something went wrong");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/expenses/${expense.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setMode("idle");
      setError("Could not delete expense");
    }
    setLoading(false);
  }

  if (mode === "confirm-delete") {
    return (
      <div className="mt-3 flex items-center gap-3">
        <p className="text-sm text-gray-600 flex-1">Delete this expense?</p>
        <Button size="sm" variant="danger" loading={loading} onClick={handleDelete}>Delete</Button>
        <Button size="sm" variant="secondary" onClick={() => setMode("idle")}>Cancel</Button>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMode("idle")} aria-hidden="true" />
        <div role="dialog" aria-modal="true" aria-label="Edit expense"
          className="fixed inset-x-4 top-16 z-50 bg-white rounded-xl shadow-xl max-w-md mx-auto p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Edit expense</h2>
            <button onClick={() => setMode("idle")} className="text-gray-400 hover:text-gray-600 p-1 rounded" aria-label="Close">✕</button>
          </div>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required autoFocus />
            <div className="flex gap-3">
              <div className="flex-1">
                <Input label="Amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="w-28">
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <Select label="Paid by" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
            <Select label="Split" value={splitMode} onChange={(e) => setSplitMode(e.target.value as SplitMode)}>
              <option value="equal">Split equally</option>
              <option value="exact">Exact amounts</option>
              <option value="percentage">By percentage</option>
              <option value="shares">By shares</option>
            </Select>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                {splitMode === "equal" ? "Split among" : "Members"}
              </legend>
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleMember(m.id)}
                      className="rounded border-gray-300 text-brand focus:ring-brand" />
                    <span className="text-sm text-gray-900 flex-1">{m.name}</span>
                    {splitMode !== "equal" && selectedIds.includes(m.id) && (
                      <input type="number" min="0" step={splitMode === "percentage" ? "1" : "0.01"}
                        value={perMember[m.id] ?? ""} onChange={(e) => setPerMember((p) => ({ ...p, [m.id]: e.target.value }))}
                        placeholder={splitMode === "percentage" ? "%" : splitMode === "shares" ? "shares" : "0.00"}
                        aria-label={`${m.name} ${splitMode}`}
                        className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-brand" />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={loading} className="flex-1">Save changes</Button>
              <Button type="button" variant="secondary" onClick={() => setMode("idle")}>Cancel</Button>
            </div>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={() => setMode("edit")}
        className="text-xs text-gray-400 hover:text-brand transition-colors"
        aria-label={`Edit ${expense.description}`}
      >
        Edit
      </button>
      <span className="text-gray-200 text-xs">·</span>
      <button onClick={() => setMode("confirm-delete")}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        aria-label={`Delete ${expense.description}`}
      >
        Delete
      </button>
    </div>
  );
}
