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
  const tier = (body as { tier: TierKey }).tier;
  const priceId = PRICE_IDS[tier];
  if (!priceId) return NextResponse.json({ error: "unknown tier" }, { status: 400 });

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
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app/plan?checkout=success`,
    cancel_url: `${origin}/app/settings?checkout=cancel`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
