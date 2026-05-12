import { NextResponse } from "next/server";

import { getCurrentUser, clearSessionCookie } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { getUser, markUserDeleted } from "@/lib/db/user";

export const runtime = "nodejs";

/**
 * Soft-delete: cancels any active Stripe subscription, marks the user record
 * with deletedAt, and signs them out. A separate batch job (Phase 10+) will
 * hard-delete after 30 days.
 */
export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);

  // Cancel active Stripe subscription so the user isn't charged after deletion.
  if (user?.stripeCustomerId && user.subscriptionPlan) {
    try {
      const subs = await stripe().subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 5,
      });
      for (const sub of subs.data) {
        if (sub.status !== "canceled" && sub.status !== "incomplete_expired") {
          await stripe().subscriptions.cancel(sub.id);
        }
      }
    } catch (err) {
      // Log but don't block deletion — user must still be removed.
      console.error("[me/delete] failed to cancel Stripe subscription:", err);
    }
  }

  await markUserDeleted(session.userId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
