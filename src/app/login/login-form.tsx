"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const result = await signIn("resend", { email, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Something went wrong. Try again.");
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4" role="status">
        <div className="text-3xl mb-3" aria-hidden="true">✉️</div>
        <p className="font-medium text-gray-900">Check your email</p>
        <p className="mt-1 text-sm text-gray-500">
          We sent a sign-in link to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm text-brand underline hover:text-brand-dark"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        required
        error={error}
      />
      <Button type="submit" loading={loading} className="w-full">
        Send sign-in link
      </Button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}
