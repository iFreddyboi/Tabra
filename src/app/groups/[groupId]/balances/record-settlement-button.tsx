"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Member = { id: string; name: string };

interface Props {
  groupId: string;
  members: Member[];
  currency: string;
}

export function RecordSettlementButton({ groupId, members, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromMember, setFromMember] = useState(members[0]?.id ?? "");
  const [toMember, setToMember] = useState(members[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }

    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromMember, toMember, amount: amt, currency, note: note || undefined }),
    });

    if (res.ok) {
      setOpen(false);
      setAmount(""); setNote("");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      const msg = typeof body?.error === "string" ? body.error : "Something went wrong";
      setError(msg);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
        Record a payment
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Record a payment</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="From" value={fromMember} onChange={(e) => setFromMember(e.target.value)}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
        <Select label="To" value={toMember} onChange={(e) => setToMember(e.target.value)}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
        <Input
          label="Amount"
          type="number" min="0.01" step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        <Input
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Venmo"
        />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="flex-1">Save</Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
