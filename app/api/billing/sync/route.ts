import { NextResponse } from "next/server";

import { planFromPriceId, stripe } from "@/lib/billing/stripe";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser, updateSubscription } from "@/lib/db/user";

export const runtime = "nodejs";

/**
 * POST /api/billing/sync
 *
 * Fetches the user's active Stripe subscription and writes it to DynamoDB.
 * Called client-side after a successful Stripe Checkout redirect so the UI
 * reflects the new plan immediately — without waiting for a webhook.
 */
export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const user = await getUser(session.userId);
    if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

    if (!user.stripeCustomerId) {
      return NextResponse.json({ plan: "free" });
    }

    // Fetch all non-canceled subscriptions — covers active, trialing, and past_due.
    const subscriptions = await stripe().subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 5,
      expand: ["data.items.data.price"],
    });

    const sub = subscriptions.data.find(
      (s) => s.status !== "canceled" && s.status !== "incomplete_expired",
    );

    if (!sub) {
      await updateSubscription(user.userId, undefined, "canceled");
      return NextResponse.json({ plan: "free" });
    }

    const priceId = sub.items.data[0]?.price.id ?? "";
    const plan = planFromPriceId(priceId);
    await updateSubscription(user.userId, plan, sub.status);

    return NextResponse.json({ plan: plan ?? "unknown", status: sub.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[billing/sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
