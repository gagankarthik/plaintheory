import { FileDown, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser, isPlusUser } from "@/lib/db/user";
import { displayName } from "@/lib/user-display";

import { AccountHeader } from "../_components/account-header";
import { AccountSettings } from "./_components/account-settings";
import { BillingSection } from "./_components/billing-section";
import { CalmModeToggle } from "./_components/calm-mode-toggle";
import { DeleteAccountButton } from "./_components/delete-account-button";
import { NotificationsSettings } from "./_components/notifications-settings";
import { SyncOnSuccess } from "./_components/sync-on-success";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  const email = user?.email ?? session.email;
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const planLabel =
    user?.subscriptionPlan === "plusMonthly"
      ? "Plus · Monthly"
      : user?.subscriptionPlan === "plusYearly"
        ? "Plus · Yearly"
        : "Free";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <SyncOnSuccess status={params.checkout ?? ""} />
      <AccountHeader
        name={displayName(email)}
        email={email}
        plan={planLabel}
        isPlus={user ? isPlusUser(user) : false}
      />

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>
            Your account details. Region and birth year can be updated below.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <AccountSettings
            email={email}
            memberSince={
              createdAt
                ? createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
            plan={planLabel}
            onboarding={user?.onboarding ?? { step: "complete" }}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Experience</CardTitle>
          <CardDescription>
            Tune how PlainTheory feels day to day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <CalmModeToggle
            initialEnabled={user?.preferences?.calmMode ?? false}
            isPlus={user ? isPlusUser(user) : false}
          />
          <div className="border-t border-border/40 pt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Notifications
            </p>
            <NotificationsSettings initial={user?.onboarding?.notifications} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">Billing</CardTitle>
              <CardDescription>
                {user?.subscriptionPlan
                  ? `You're on ${planLabel}.`
                  : "You're on the free plan. Upgrade to unlock all features."}
              </CardDescription>
            </div>
            {user?.stripeCustomerId ? (
              <Link href="/app/billing" className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline mt-1">
                View invoices →
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <BillingSection
            subscriptionPlan={user?.subscriptionPlan}
            subscriptionStatus={user?.subscriptionStatus}
            planLabel={planLabel}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Your data</CardTitle>
          <CardDescription>
            Download a polished wellness summary with your check-in averages, streaks, and a recent-logs appendix.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 px-6 pb-6">
          {user && isPlusUser(user) ? (
            <Link href="/api/me/export">
              <Button variant="outline" className="gap-1.5">
                <FileDown className="size-4" />
                Download wellness summary (PDF)
              </Button>
            </Link>
          ) : (
            <>
              <Button variant="outline" className="gap-1.5" disabled>
                <Lock className="size-4" />
                Download wellness summary (PDF)
              </Button>
              <Link href="/pricing">
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="size-3.5" />
                  Plus only — upgrade
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Policies</CardTitle>
          <CardDescription>How we handle your data and access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-6 pb-6">
          <Link href="/privacy">
            <Button variant="ghost" size="sm">
              Privacy policy
            </Button>
          </Link>
          <Link href="/terms">
            <Button variant="ghost" size="sm">
              Terms
            </Button>
          </Link>
          <Link href="/accessibility">
            <Button variant="ghost" size="sm">
              Accessibility
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Delete your account. Soft-deleted for 30 days, then permanently removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}

