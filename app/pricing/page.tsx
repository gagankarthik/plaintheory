import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Start the daily habit.",
    features: ["1 focus area", "Daily plan", "5 chat messages / day", "Mood + energy logs"],
    cta: { label: "Get started", href: "/sign-up" },
    highlight: false,
  },
  {
    name: "Plus",
    price: "$19",
    cadence: "/ month",
    description: "Everything that compounds.",
    features: [
      "Unlimited focus areas",
      "Unlimited chat",
      "Weekly insights",
      "Personal reflection PDF",
    ],
    cta: { label: "Start Plus", href: "/sign-up?tier=plus" },
    highlight: true,
  },
  {
    name: "Premium",
    price: "$39",
    cadence: "/ month",
    description: "Coming soon — voice, integrations, family.",
    features: [
      "Everything in Plus",
      "Voice mode (coming soon)",
      "Apple Health / Google Fit",
      "Family sharing",
    ],
    cta: { label: "Join waitlist", href: "/sign-up?tier=premium" },
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/">
          <LogoWithWordmark />
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12 sm:px-10">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Simple. Pay when it matters.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
            Free is enough for the habit to take. Plus unlocks the compounding parts when
            you&rsquo;re ready.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlight
                  ? "border-primary/40 shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_24px_48px_-20px_rgb(0_0_0_/_0.12)]"
                  : "border-border/60"
              }
            >
              <CardHeader className="space-y-2 px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  {tier.highlight ? <Badge variant="primary">Most popular</Badge> : null}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <div className="pt-2">
                  <span className="font-serif text-3xl">{tier.price}</span>
                  <span className="text-sm text-muted-foreground"> {tier.cadence}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <ul className="space-y-1.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="text-foreground">
                      · {f}
                    </li>
                  ))}
                </ul>
                <Link href={tier.cta.href}>
                  <Button variant={tier.highlight ? "default" : "outline"} className="w-full">
                    {tier.cta.label}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          General coaching, not therapy or medical advice. Cancel anytime.
        </p>
      </main>
    </div>
  );
}
