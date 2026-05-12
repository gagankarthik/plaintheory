import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { PRICE_IDS, stripe, type TierKey } from "@/lib/billing/stripe";
import { getUser, setStripeCustomerId } from "@/lib/db/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("tier" in body) ||
    typeof (body as { tier: unknown }).tier !== "string"
  ) {
    return NextResponse.json({ error: "missing tier" }, { status: 400 });
  }

  const tier = (body as { tier: TierKey; returnTo?: string }).tier;
  const rawReturnTo = (body as { tier: TierKey; returnTo?: string }).returnTo;
  const returnTo = rawReturnTo === "settings" ? "settings" : undefined;
  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    return NextResponse.json(
      { error: `No price configured for tier "${tier}". Add the price_ ID (not prod_ ID) to your environment.` },
      { status: 400 },
    );
  }
  if (!priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: `Invalid price ID "${priceId}" — Stripe price IDs start with "price_", not "prod_". Open the product in Stripe Dashboard, find the Pricing section, and copy the price_ ID.` },
      { status: 400 },
    );
  }

  try {
    const user = await getUser(session.userId);
    if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email,
        metadata: { userId: user.userId },
      });
      customerId = customer.id;
      await setStripeCustomerId(user.userId, customerId);
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const successPath = returnTo === "settings"
      ? "/app/settings?checkout=success"
      : "/app/plan?checkout=success";
    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/app/settings?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[billing/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
