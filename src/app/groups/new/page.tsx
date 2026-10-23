import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { NewGroupForm } from "./new-group-form";

export const metadata: Metadata = { title: "New group" };

export default function NewGroupPage() {
  return (
    <AppShell>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">New group</h1>
        <NewGroupForm />
      </div>
    </AppShell>
  );
}
