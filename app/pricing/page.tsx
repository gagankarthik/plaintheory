import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

import { PricingCards } from "./_components/pricing-cards";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let currentPlan: string = "free";
  let isLoggedIn = false;

  try {
    const session = await getCurrentUser();
    if (session) {
      isLoggedIn = true;
      const user = await getUser(session.userId);
      if (user?.subscriptionPlan) {
        currentPlan = user.subscriptionPlan;
      }
    }
  } catch {
    // unauthenticated — treat as logged out
  }

  const homeHref = isLoggedIn ? "/app" : "/";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href={homeHref}>
          <LogoWithWordmark />
        </Link>
        <div className="flex items-center gap-2">
          <Link href={homeHref}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
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
        <PricingCards currentPlan={currentPlan} isLoggedIn={isLoggedIn} />
        <p className="text-center text-xs text-muted-foreground">
          General coaching, not therapy or medical advice. Cancel anytime.
        </p>
      </main>
    </div>
  );
}
