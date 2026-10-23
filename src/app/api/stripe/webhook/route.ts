import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users, stripeEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Stripe retries failed webhooks — every handler must be idempotent.
// We log the event id and skip if already processed.
async function markProcessed(eventId: string, type: string): Promise<boolean> {
  try {
    await db.insert(stripeEvents).values({ id: eventId, type });
    return true; // inserted — first time
  } catch {
    return false; // already processed
  }
}

async function setPlan(
  customerId: string,
  plan: "free" | "trip" | "annual",
  expiresAt?: Date
) {
  await db
    .update(users)
    .set({ plan, planExpiresAt: expiresAt ?? null })
    .where(eq(users.stripeCustomerId, customerId));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const isNew = await markProcessed(event.id, event.type);
  if (!isNew) return NextResponse.json({ ok: true, skipped: true });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const mode = session.mode;

      if (mode === "subscription") {
        await setPlan(customerId, "annual");
      } else if (mode === "payment") {
        // One-time Trip purchase — no expiry (it's per group, not time-based)
        await setPlan(customerId, "trip");
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      if (sub.status === "active" || sub.status === "trialing") {
        const expiresAt = new Date((sub.current_period_end ?? 0) * 1000);
        await setPlan(customerId, "annual", expiresAt);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setPlan(sub.customer as string, "free");
      break;
    }

    case "invoice.payment_failed": {
      // Don't immediately downgrade — Stripe retries. Log for support.
      const invoice = event.data.object as Stripe.Invoice;
      console.warn("Payment failed for customer", invoice.customer);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
