import Stripe from "stripe";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  cached = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return cached;
}

export const PRICE_IDS = {
  plusMonthly: process.env.STRIPE_PRICE_PLUS_MONTHLY,
  plusYearly: process.env.STRIPE_PRICE_PLUS_YEARLY,
  premiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
} as const;

export type TierKey = keyof typeof PRICE_IDS;
