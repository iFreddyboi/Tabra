"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Member = { id: string; name: string; userId: string | null };
type SplitMode = "equal" | "exact" | "percentage" | "shares";

interface Props {
  groupId: string;
  members: Member[];
  myMemberId: string;
  currency: string;
}

export function AddExpenseModal({ groupId, members, myMemberId, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(myMemberId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState<SplitMode>("equal");
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map((m) => m.id));
  const [perMember, setPerMember] = useState<Record<string, string>>({});

  function toggleMember(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const amt = parseFloat(amount);
    if (!description.trim()) { setError("Description is required"); return; }
    if (!amount || isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return; }
    if (selectedIds.length === 0) { setError("Select at least one member to split with"); return; }

    const splitPayload =
      mode === "equal"
        ? { mode: "equal", memberIds: selectedIds }
        : {
            mode,
            memberIds: selectedIds,
            perMember: Object.fromEntries(
              selectedIds.map((id) => [id, parseFloat(perMember[id] ?? "0")])
            ),
          };

    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description.trim(),
        amount: amt,
        currency,
        paidBy,
        date,
        split: splitPayload,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setDescription(""); setAmount(""); setMode("equal");
      setSelectedIds(members.map((m) => m.id));
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + Add expense
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add expense"
        className="fixed inset-x-4 top-16 z-50 bg-white rounded-xl shadow-xl max-w-md mx-auto p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Add expense</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner, Airbnb, Groceries"
            required
            autoFocus
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="w-28">
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <Select
            label="Paid by"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>

          <Select
            label="Split"
            value={mode}
            onChange={(e) => setMode(e.target.value as SplitMode)}
          >
            <option value="equal">Split equally</option>
            <option value="exact">Exact amounts</option>
            <option value="percentage">By percentage</option>
            <option value="shares">By shares</option>
          </Select>

          {/* Member checkboxes */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              {mode === "equal" ? "Split among" : "Members"}
            </legend>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <label key={m.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-900 flex-1">{m.name}</span>
                  {mode !== "equal" && selectedIds.includes(m.id) && (
                    <input
                      type="number"
                      min="0"
                      step={mode === "percentage" ? "1" : "0.01"}
                      value={perMember[m.id] ?? ""}
                      onChange={(e) => setPerMember((p) => ({ ...p, [m.id]: e.target.value }))}
                      placeholder={mode === "percentage" ? "%" : mode === "shares" ? "shares" : "0.00"}
                      aria-label={`${m.name} ${mode}`}
                      className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} className="flex-1">Save expense</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    </>
  );
}
