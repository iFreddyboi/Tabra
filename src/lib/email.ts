import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM ?? "hello@tabra.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tabra.app";

// ── Verification / magic link ────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, url: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Sign in to Tabra",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td>
          <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f766e">Tabra</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827">Your sign-in link</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280">Click the button below to sign in. This link expires in 10 minutes and can only be used once.</p>
          <a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">Sign in to Tabra</a>
          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af">Or copy this link: <a href="${url}" style="color:#0f766e;word-break:break-all">${url}</a></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#9ca3af">If you didn't request this, you can safely ignore it. Someone may have entered your email by mistake.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ── Renewal reminder (7 days before) ────────────────────────────────────────

export async function sendRenewalReminderEmail(
  to: string,
  renewalDate: string,
  daysLeft: number
) {
  const portalUrl = `${APP_URL}/account/billing`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Tabra Annual renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td>
          <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f766e">Tabra</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827">Renewal in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280">Your Tabra Annual plan renews on <strong>${renewalDate}</strong> for $19.99. Nothing to do if you want to keep going.</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280">Want to cancel before then? One click and you're done — no forms, no questions.</p>
          <a href="${portalUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">Manage subscription</a>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#9ca3af">Tabra · <a href="${APP_URL}/legal/privacy" style="color:#9ca3af">Privacy</a> · <a href="${APP_URL}/legal/terms" style="color:#9ca3af">Terms</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ── Cancellation confirmation ────────────────────────────────────────────────

export async function sendCancellationEmail(to: string, accessUntil: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your Tabra Annual has been cancelled",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td>
          <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f766e">Tabra</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827">Cancellation confirmed</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280">Your Tabra Annual plan is cancelled. You'll keep access to all Annual features until <strong>${accessUntil}</strong>, after which your account moves to the free plan.</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280">Your groups, balances and history are safe — nothing gets deleted.</p>
          <a href="${APP_URL}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">Go to Tabra</a>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#9ca3af">Changed your mind? You can resubscribe at any time from your account settings.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ── Expense notification ─────────────────────────────────────────────────────

export async function sendExpenseNotificationEmail(
  to: string,
  opts: {
    groupName: string;
    addedBy: string;
    description: string;
    amount: string;
    currency: string;
    yourShare: string;
    groupUrl: string;
  }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${opts.addedBy} added "${opts.description}" in ${opts.groupName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td>
          <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f766e">Tabra</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827">New expense in ${opts.groupName}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;padding:20px;margin:0 0 24px">
            <tr>
              <td style="font-size:15px;color:#111827;font-weight:600">${opts.description}</td>
              <td align="right" style="font-size:15px;color:#111827;font-weight:600">${opts.currency} ${opts.amount}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-top:4px">Added by ${opts.addedBy}</td>
              <td align="right" style="font-size:13px;color:#6b7280;padding-top:4px">Your share: ${opts.currency} ${opts.yourShare}</td>
            </tr>
          </table>
          <a href="${opts.groupUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">View group</a>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#9ca3af">You're receiving this because you're a member of ${opts.groupName}. <a href="${APP_URL}/account/notifications" style="color:#9ca3af">Manage notifications</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
