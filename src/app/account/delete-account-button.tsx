"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch("/api/account", { method: "DELETE" });
    signOut({ callbackUrl: "/login" });
  }

  if (confirming) {
    return (
      <div className="flex gap-2" role="dialog" aria-label="Confirm account deletion">
        <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
          Yes, delete
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Keep account
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      Delete account
    </Button>
  );
}
