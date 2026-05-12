import { NextResponse } from "next/server";

import { stripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }
  const rawBody = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature check failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // Idempotency: Stripe will retry; ignore duplicates by event.id if needed.
  // For now we just log and acknowledge — wire subscription state to DDB later.
  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      console.info("[stripe webhook]", event.type, event.id);
      break;
    default:
      // ignore
      break;
  }

  return NextResponse.json({ received: true });
}
