import type { SubscriptionPlan } from "@/lib/db/user";

/**
 * A friendly display name derived from an email address — the first segment
 * before @, split on separators, title-cased. e.g. "ava.chen@x.com" → "Ava".
 * The app has no stored display name, so this is the single source of truth.
 */
export function displayName(email: string): string {
  const base = email.split("@")[0] ?? "there";
  const first = base.split(/[.\-_+]/)[0] || base;
  return first.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function planLabel(plan?: SubscriptionPlan | null): string {
  if (plan === "plusMonthly") return "Plus · Monthly";
  if (plan === "plusYearly") return "Plus · Yearly";
  return "Free";
}
