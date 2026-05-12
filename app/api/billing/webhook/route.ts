import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { planFromPriceId, stripe } from "@/lib/billing/stripe";
import { findByStripeCustomerId, updateSubscription, type SubscriptionPlan } from "@/lib/db/user";

export const runtime = "nodejs";


function customerId(obj: { customer: string | Stripe.Customer | Stripe.DeletedCustomer }): string {
  return typeof obj.customer === "string" ? obj.customer : obj.customer.id;
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature check failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const cid = customerId(sub);
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = planFromPriceId(priceId);
      const user = await findByStripeCustomerId(cid);
      if (user) {
        await updateSubscription(user.userId, plan, sub.status);
      }
      console.info("[stripe webhook]", event.type, event.id, plan, sub.status);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const cid = customerId(sub);
      const user = await findByStripeCustomerId(cid);
      if (user) {
        await updateSubscription(user.userId, undefined, "canceled");
      }
      console.info("[stripe webhook]", event.type, event.id, "canceled");
      break;
    }
    case "checkout.session.completed":
    case "invoice.payment_failed":
      console.info("[stripe webhook]", event.type, event.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
