"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageBillingButton({ action }: { action: "upgrade" | "portal" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <Button
      variant={action === "upgrade" ? "primary" : "secondary"}
      size="sm"
      loading={loading}
      onClick={handleClick}
      className="flex-shrink-0"
    >
      {action === "upgrade" ? "Upgrade" : "Manage"}
    </Button>
  );
}
