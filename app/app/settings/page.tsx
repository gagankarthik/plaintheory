import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

import { AccountSettings } from "./_components/account-settings";
import { DeleteAccountButton } from "./_components/delete-account-button";
import { ManageBillingButton } from "./_components/manage-billing-button";
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
      <header className="flex items-center gap-4">
        <Avatar seed={email} size={56} className="size-14" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </p>
          <h1 className="font-serif text-3xl tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </header>

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
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>
            Choose how PlainTheory stays in touch. You can change these anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <NotificationsSettings initial={user?.onboarding?.notifications} />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Billing</CardTitle>
          <CardDescription>
            {user?.subscriptionPlan
              ? `You're on ${planLabel}. Manage your subscription, update card, or cancel.`
              : "You're on the free plan. Upgrade to unlock everything."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {user?.subscriptionPlan ? (
            <ManageBillingButton />
          ) : (
            <Link href="/pricing">
              <Button>See plans</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Your data</CardTitle>
          <CardDescription>
            Download your data anytime. We never share or sell it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-6 pb-6">
          <Link href="/api/me/export">
            <Button variant="outline">Download my data (JSON)</Button>
          </Link>
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

