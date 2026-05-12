import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { planFromPriceId, stripe } from "@/lib/billing/stripe";
import {
  findByStripeCustomerId,
  setStripeCustomerId,
  updateSubscription,
} from "@/lib/db/user";

export const runtime = "nodejs";

// Stripe requires the raw body to verify the signature — do not parse as JSON.
export const preferredRegion = "auto";

// ─── helpers ────────────────────────────────────────────────────────────────

function toCustomerId(
  c: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!c) return null;
  return typeof c === "string" ? c : c.id;
}

async function handleSubscription(
  sub: Stripe.Subscription,
  eventId: string,
  eventType: string,
) {
  const cid = toCustomerId(sub.customer);
  if (!cid) return;

  const priceId = sub.items.data[0]?.price?.id;
  if (!priceId) {
    console.warn("[webhook] subscription has no price item", sub.id, eventType, eventId);
    return;
  }
  const plan = planFromPriceId(priceId);
  const user = await findByStripeCustomerId(cid);

  if (!user) {
    console.warn("[webhook] no user for customer", cid, eventType, eventId);
    return;
  }

  await updateSubscription(user.userId, plan, sub.status);
  console.info("[webhook]", eventType, eventId, "→", plan ?? "none", sub.status);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Link customer to user record if this is their first checkout.
  const cid = toCustomerId(session.customer);
  const userId = session.metadata?.userId;

  if (cid && userId) {
    const existing = await findByStripeCustomerId(cid);
    if (!existing) {
      await setStripeCustomerId(userId, cid);
    }
  }

  // If a subscription was created, update subscription state immediately
  // rather than waiting for the customer.subscription.created event.
  if (session.subscription && cid) {
    const sub = await stripe().subscriptions.retrieve(
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id,
    );
    await handleSubscription(sub, session.id, "checkout.session.completed");
  }
}

// ─── route ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "server misconfiguration" }, { status: 500 });
  }
  if (!sig) {
    console.error("[webhook] missing stripe-signature header");
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // Always return 200 after verification so Stripe doesn't retry due to our
  // internal errors — log failures instead.
  try {
    switch (event.type) {
      // ── Subscription lifecycle ──────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscription(
          event.data.object as Stripe.Subscription,
          event.id,
          event.type,
        );
        break;

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const cid = toCustomerId(sub.customer);
        if (cid) {
          const user = await findByStripeCustomerId(cid);
          if (user) {
            await updateSubscription(user.userId, undefined, "canceled");
            console.info("[webhook] subscription canceled", event.id, user.userId);
          }
        }
        break;
      }

      // ── Checkout ────────────────────────────────────────────────────────
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // ── Payment failures ────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const cid = toCustomerId(invoice.customer);
        if (cid) {
          const user = await findByStripeCustomerId(cid);
          if (user) {
            // Mark past_due but keep the plan — Stripe will retry payment.
            await updateSubscription(user.userId, user.subscriptionPlan, "past_due");
            console.info("[webhook] payment failed", event.id, user.userId);
          }
        }
        break;
      }

      // ── Renewals ────────────────────────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const cid = toCustomerId(invoice.customer);
        if (cid && invoice.subscription) {
          const sub = await stripe().subscriptions.retrieve(
            typeof invoice.subscription === "string"
              ? invoice.subscription
              : invoice.subscription.id,
          );
          await handleSubscription(sub, event.id, "invoice.paid");
        }
        break;
      }

      default:
        // Unhandled event — not an error, just ignore.
        break;
    }
  } catch (err) {
    // Log but still return 200 so Stripe doesn't retry indefinitely.
    console.error("[webhook] handler error for", event.type, event.id, err);
  }

  return NextResponse.json({ received: true });
}
