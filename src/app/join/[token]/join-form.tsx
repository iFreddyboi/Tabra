"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JoinForm({ groupId, token }: { groupId: string; token: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Your name is required"); return; }
    if (name.length > 100) { setError("Name must be 100 characters or fewer"); return; }

    setLoading(true);
    const res = await fetch(`/api/groups/join/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email || undefined }),
    });

    if (res.ok) {
      setJoined(true);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  if (joined) {
    return (
      <div className="text-center py-4" role="status">
        <p className="text-3xl mb-3" aria-hidden="true">🎉</p>
        <p className="font-medium text-gray-900">You&apos;re in, {name}!</p>
        <p className="mt-2 text-sm text-gray-500">
          The group owner will share a link to view expenses and balances.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="How you appear to the group"
        required
        autoFocus
        error={error}
      />
      <Input
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="For expense notifications"
        hint="Used only for expense alerts. Never shared."
      />
      <Button type="submit" loading={loading} className="w-full">
        Join group
      </Button>
    </form>
  );
}
