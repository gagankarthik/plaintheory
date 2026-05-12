import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { getUser, updateSubscription } from "@/lib/db/user";

export const runtime = "nodejs";

export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user?.stripeCustomerId || !user.subscriptionPlan) {
    return NextResponse.json({ error: "no active subscription" }, { status: 400 });
  }

  try {
    // Fetch all subscriptions (not just active) to catch trialing and past_due.
    const subs = await stripe().subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 5,
    });

    const sub = subs.data.find(
      (s) => s.status !== "canceled" && s.status !== "incomplete_expired",
    );

    if (!sub) {
      // Already gone on Stripe — clear DB state to match.
      await updateSubscription(user.userId, undefined, "canceled");
      return NextResponse.json({ canceled: true });
    }

    // Cancel at period end so the user keeps access until the billing cycle ends.
    const updated = await stripe().subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });
    await updateSubscription(user.userId, user.subscriptionPlan, "canceling");

    const periodEnd = updated.items.data[0]?.current_period_end ?? null;
    return NextResponse.json({ canceled: true, periodEnd });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[billing/cancel]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
