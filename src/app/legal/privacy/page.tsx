import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 2026</p>

        <div className="prose prose-sm text-gray-700 space-y-6">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. What we collect</h2>
            <p>When you sign in, we collect your name and email address from Google OAuth or via a magic link you request. We store the expenses, groups and settlements you create inside the app.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. How we use it</h2>
            <p>We use your email to send sign-in links and, if you opt in, expense notifications. We never sell your data or share it with advertisers.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Third-party processors</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Neon</strong> — database hosting (your expense data lives here)</li>
              <li><strong>Vercel</strong> — app hosting and serverless functions</li>
              <li><strong>Google</strong> — OAuth sign-in (if you use "Continue with Google")</li>
              <li><strong>Resend</strong> — transactional email (magic links, notifications)</li>
              <li><strong>Stripe</strong> — payment processing for paid plans (no card data touches our servers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Cookies and sessions</h2>
            <p>We use a single HTTP-only session cookie to keep you signed in. No tracking cookies, no analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Data retention</h2>
            <p>Your data is retained while your account is active. You can delete your account at any time from account settings, which permanently deletes all your groups, expenses and personal data.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Your rights</h2>
            <p>You can request a copy of your data or ask us to delete it by emailing <a href="mailto:hello@tabra.app" className="text-brand underline">hello@tabra.app</a>. If you are in the EU or UK, you have additional rights under GDPR/UK GDPR including the right to rectification and portability.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>Questions? Email <a href="mailto:hello@tabra.app" className="text-brand underline">hello@tabra.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
