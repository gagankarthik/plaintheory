"use client";

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";
type TierKey = "plusMonthly" | "plusYearly";

const PLUS_FEATURES = [
  "Unlimited focus areas",
  "Unlimited chat",
  "Weekly insights",
  "Personal reflection PDF",
];

const FREE_FEATURES = ["1 focus area", "Daily plan", "5 chat messages / day", "Mood + energy logs"];

function CheckoutButton({
  tierKey,
  isCurrentPlan,
  isLoggedIn,
  label,
}: {
  tierKey: TierKey;
  isCurrentPlan: boolean;
  isLoggedIn: boolean;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  if (isCurrentPlan) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href={`/sign-up?tier=${tierKey}`} className="block w-full">
        <Button className="w-full">{label}</Button>
      </Link>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start checkout. Try again.");
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {loading ? "Redirecting…" : label}
    </Button>
  );
}

export function PricingCards({
  currentPlan,
  isLoggedIn,
}: {
  currentPlan?: string;
  isLoggedIn: boolean;
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const activeTierKey: TierKey = cycle === "yearly" ? "plusYearly" : "plusMonthly";
  const isCurrentPlus = currentPlan === activeTierKey;

  return (
    <div className="space-y-8">
      {/* Billing cycle toggle */}
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card p-1">
        {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCycle(c)}
            className={cn(
              "relative rounded-full px-5 py-1.5 text-sm font-medium transition-all",
              cycle === c
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "monthly" ? "Monthly" : "Yearly"}
            {c === "yearly" ? (
              <span className="ml-1.5 text-[10px] font-semibold text-success">Save 21%</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Free */}
        <Card className="border-border/60">
          <CardHeader className="space-y-2 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Free</CardTitle>
              {currentPlan === "free" ? <Badge variant="primary">Current plan</Badge> : null}
            </div>
            <CardDescription>Start the daily habit.</CardDescription>
            <div className="pt-2">
              <span className="font-serif text-3xl">$0</span>
              <span className="text-sm text-muted-foreground"> / forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <ul className="space-y-1.5 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            {!isLoggedIn ? (
              <Link href="/sign-up" className="block w-full">
                <Button variant="outline" className="w-full">Get started</Button>
              </Link>
            ) : currentPlan === "free" ? (
              <Button variant="outline" className="w-full" disabled>Current plan</Button>
            ) : (
              <Link href="/app" className="block w-full">
                <Button variant="outline" className="w-full">Go to app</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Plus */}
        <Card className="border-primary/40 shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_24px_48px_-20px_rgb(0_0_0_/_0.12)]">
          <CardHeader className="space-y-2 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plus</CardTitle>
              {isCurrentPlus ? (
                <Badge variant="success">Current plan</Badge>
              ) : (
                <Badge variant="primary">Most popular</Badge>
              )}
            </div>
            <CardDescription>Everything that compounds.</CardDescription>
            <div className="pt-2">
              <span className="font-serif text-3xl">{cycle === "yearly" ? "$15" : "$19"}</span>
              <span className="text-sm text-muted-foreground"> / month</span>
              {cycle === "yearly" ? (
                <p className="mt-0.5 text-xs text-muted-foreground">billed $179 / yr</p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <ul className="space-y-1.5 text-sm">
              {PLUS_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton
              tierKey={activeTierKey}
              isCurrentPlan={isCurrentPlus}
              isLoggedIn={isLoggedIn}
              label={`Start Plus · ${cycle === "yearly" ? "Yearly" : "Monthly"}`}
            />
          </CardContent>
        </Card>

        {/* Premium */}
        <Card className="border-border/60">
          <CardHeader className="space-y-2 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Premium</CardTitle>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[180px] items-center justify-center px-6 pb-6">
            <p className="text-center text-sm text-muted-foreground">
              Something bigger is on the way.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
