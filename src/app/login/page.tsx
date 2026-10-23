import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand">Tabra</p>
          <p className="mt-1 text-sm text-gray-500">Split anything. Owe nothing for long.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-base font-semibold text-gray-900 mb-4">Sign in</h1>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          By signing in you agree to our{" "}
          <a href="/legal/terms" className="underline hover:text-gray-600">Terms</a>
          {" "}and{" "}
          <a href="/legal/privacy" className="underline hover:text-gray-600">Privacy policy</a>.
        </p>
      </div>
    </div>
  );
}
