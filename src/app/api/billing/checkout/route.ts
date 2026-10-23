import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, unauthorized } from "@/lib/auth-guard";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { action } = await req.json().catch(() => ({ action: "upgrade" }));
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // If existing Stripe customer, use Customer Portal for manage
  if (action === "portal" && user.stripeCustomerId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/account`,
    });
    return NextResponse.json({ url: portalSession.url });
  }

  // Otherwise: create/get customer, then Checkout
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ANNUAL!, quantity: 1 }],
    success_url: `${APP_URL}/account?upgraded=1`,
    cancel_url: `${APP_URL}/account`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
