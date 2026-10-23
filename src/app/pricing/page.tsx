import type { Metadata } from "next";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Pricing" };

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For everyone, with no strings attached.",
    features: [
      "Unlimited groups",
      "Unlimited expenses",
      "Equal, exact, %, and share splits",
      "Guest join (no account needed)",
      "GPay & PhonePe UPI deeplinks",
      "Debt simplification",
    ],
    cta: "Get started",
    ctaHref: "/login",
    highlight: false,
  },
  {
    name: "Annual",
    price: "$19.99",
    period: "per year",
    description: "For power users and frequent travellers.",
    features: [
      "Everything in Free",
      "Receipt photo uploads",
      "CSV export",
      "Monthly balance summary emails",
      "Priority support",
    ],
    cta: "Subscribe",
    ctaHref: "/account",
    highlight: true,
  },
  {
    name: "Trip",
    price: "$2.99",
    period: "one-time",
    description: "One group, one trip, no recurring charge.",
    features: [
      "All free features for one group",
      "Receipt uploads for that group",
      "CSV export for that group",
    ],
    cta: "Buy trip pass",
    ctaHref: "/account",
    highlight: false,
  },
];

const competitors = [
  { name: "Tabra", free: "Unlimited, no cap", monthly: "$0 or $1.67/mo", annual: "$19.99/yr", notes: "No ads, no timer" },
  { name: "Splitwise", free: "3–5/day cap + 10s timer", monthly: "~$3.33/mo", annual: "$39.99/yr", notes: "Ads in free tier" },
  { name: "Tricount", free: "Unlimited", monthly: "Free", annual: "Free", notes: "No receipt uploads" },
  { name: "Settle Up", free: "Limited groups", monthly: "~$3.49/mo", annual: "~$29.99/yr", notes: "Paid for split modes" },
];

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-bold text-brand text-lg">Tabra</a>
          {session ? (
            <Button asChild href="/dashboard" variant="secondary" size="sm">Dashboard</Button>
          ) : (
            <Button asChild href="/login" size="sm">Sign in</Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Simple, honest pricing</h1>
          <p className="mt-2 text-gray-500">The free plan is actually free. No daily cap, no ads, no tricks.</p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 flex flex-col ${tier.highlight ? "border-brand bg-brand-surface shadow-md" : "border-gray-100 bg-white shadow-sm"}`}
            >
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tier.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {tier.price}
                  <span className="text-base font-normal text-gray-400 ml-1">{tier.period}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
              </div>
              <ul className="flex flex-col gap-2 flex-1 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-brand mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                href={tier.ctaHref}
                variant={tier.highlight ? "primary" : "secondary"}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How we compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">App</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Free tier</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Monthly</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Annual</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr key={c.name} className={`border-b border-gray-50 ${i === 0 ? "font-semibold bg-brand-surface" : ""}`}>
                    <td className="py-2.5 pr-4 text-gray-900">{c.name}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{c.free}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{c.monthly}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{c.annual}</td>
                    <td className="py-2.5 text-gray-500">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Prices as of October 2026. Subject to change.</p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Questions</h2>
          <div className="flex flex-col gap-5">
            {[
              { q: "Can I cancel any time?", a: "Yes — one click in your account settings. No forms, no questions. You keep access until the end of your paid period." },
              { q: "Will I get a reminder before renewal?", a: "Yes. We send a reminder 7 days and 1 day before your annual plan renews. You'll always have time to cancel if you want to." },
              { q: "Does the free plan really have no limits?", a: "Really. Unlimited groups, unlimited expenses per day, no ads in the expense flow. We think paywalling core features creates resentment, not revenue." },
              { q: "Can guests join without an account?", a: "Yes. Share an invite link. Anyone can join and be included in splits without signing up. They can create an account later if they want to." },
              { q: "What payment methods do you accept?", a: "Any card Stripe accepts — Visa, Mastercard, Amex, and many local methods depending on your country." },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-medium text-gray-900">{q}</p>
                <p className="text-sm text-gray-500 mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button asChild href="/login" size="lg">Get started free</Button>
        </div>
      </div>
    </div>
  );
}
