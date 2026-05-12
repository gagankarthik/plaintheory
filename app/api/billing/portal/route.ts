import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { getUser } from "@/lib/db/user";

export const runtime = "nodejs";

export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await getUser(session.userId);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "no stripe customer" }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/app/settings`,
  });
  return NextResponse.json({ url: portal.url });
}
