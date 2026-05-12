import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

import { DeleteAccountButton } from "./_components/delete-account-button";
import { ManageBillingButton } from "./_components/manage-billing-button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  const email = user?.email ?? session.email;
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center gap-4">
        <Avatar seed={email} size={56} className="size-14" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </p>
          <h1 className="font-serif text-3xl tracking-tight">Account</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </header>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Account info</CardTitle>
          <CardDescription>Read-only summary of your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
          <Stat label="Email" value={email} />
          <Stat
            label="Member since"
            value={
              createdAt
                ? createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
          />
          <Stat
            label="Plan"
            value={user?.stripeCustomerId ? "Plus" : "Free"}
          />
          <Stat label="Region" value={user?.onboarding.region ?? "—"} />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Billing</CardTitle>
          <CardDescription>
            {user?.stripeCustomerId
              ? "Manage your subscription, update card, or cancel."
              : "You're on the free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {user?.stripeCustomerId ? (
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-medium text-foreground">{value}</p>
    </div>
  );
}
