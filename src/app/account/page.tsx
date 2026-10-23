import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SignOutButton } from "./sign-out-button";
import { DeleteAccountButton } from "./delete-account-button";
import { ManageBillingButton } from "./manage-billing-button";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  return (
    <AppShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Account</h1>

      {/* Profile */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-700">Profile</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-1">
          <p className="text-sm text-gray-900">{user?.name ?? "—"}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </CardBody>
      </Card>

      {/* Plan */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-700">Plan</h2>
        </CardHeader>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 capitalize">{user?.plan ?? "free"}</p>
            {user?.plan === "annual" && user.planExpiresAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                Renews {new Date(user.planExpiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            {user?.plan === "free" && (
              <p className="text-xs text-gray-400 mt-0.5">Unlimited groups and expenses, always.</p>
            )}
          </div>
          {user?.plan === "free" ? (
            <ManageBillingButton action="upgrade" />
          ) : (
            <ManageBillingButton action="portal" />
          )}
        </CardBody>
      </Card>

      {/* Session */}
      <Card className="mb-4">
        <CardBody className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Signed in as {user?.email}</p>
          <SignOutButton />
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardHeader>
          <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
        </CardHeader>
        <CardBody className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Permanently delete your account and all your data. Your groups and expenses will remain for other members.
          </p>
          <DeleteAccountButton />
        </CardBody>
      </Card>
    </AppShell>
  );
}
