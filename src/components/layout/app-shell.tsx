import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between" aria-label="Main navigation">
          <Link href="/dashboard" className="font-bold text-brand text-lg tracking-tight">
            Tabra
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Groups
            </Link>
            <Link
              href="/account"
              className="w-8 h-8 rounded-full bg-brand-surface border border-brand/20 flex items-center justify-center text-brand text-sm font-semibold"
              aria-label="Account settings"
            >
              {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase() ?? "?"}
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
