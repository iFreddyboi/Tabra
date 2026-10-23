"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteButton({ groupId, token }: { groupId: string; token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/join/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} aria-live="polite">
      {copied ? "✓ Copied" : "Invite link"}
    </Button>
  );
}
