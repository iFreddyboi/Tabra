"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CHF", "NZD"];

export function NewGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Group name is required";
    if (name.length > 255) errs.name = "Name must be 255 characters or fewer";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), currency }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/groups/${data.id}`);
    } else {
      setLoading(false);
      setErrors({ name: "Something went wrong. Try again." });
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lisbon Trip, Flat 4B"
            required
            autoFocus
            error={errors.name}
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} className="flex-1">
              Create group
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
