import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 2026</p>

        <div className="prose prose-sm text-gray-700 space-y-6">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. What Tabra is</h2>
            <p>Tabra is an expense-splitting tool. It helps groups of people track shared expenses and calculate who owes whom. It does not hold, transfer or process money on your behalf.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Your account</h2>
            <p>You must provide a valid email address to use Tabra. You are responsible for keeping your account secure. Do not share your sign-in links with others.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Acceptable use</h2>
            <p>You agree not to use Tabra to record fraudulent or illegal transactions, to harass other users, or to attempt to access other users' data. We may suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Paid plans</h2>
            <p>Paid plans are billed through Stripe. You can cancel at any time from account settings — cancellation takes effect at the end of your billing period. We do not offer refunds for partial periods.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Availability</h2>
            <p>We aim to keep Tabra available but make no uptime guarantees. We are not liable for lost data or downtime. Keep your own records of important financial obligations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Limitation of liability</h2>
            <p>Tabra is provided as-is. We are not liable for any disputes between users about money owed. The app is a calculator — settling debts is your responsibility.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Changes</h2>
            <p>We may update these terms. We will notify you by email before significant changes take effect. Continued use of Tabra after changes means you accept the updated terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Governing law</h2>
            <p>These terms are governed by the laws of India. Disputes will be resolved in the courts of India.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Contact</h2>
            <p>Questions? Email <a href="mailto:hello@tabra.app" className="text-brand underline">hello@tabra.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
