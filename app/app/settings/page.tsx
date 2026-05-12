import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

import { DeleteAccountButton } from "./_components/delete-account-button";
import { EditProfile } from "./_components/edit-profile";
import { ManageBillingButton } from "./_components/manage-billing-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  const email = user?.email ?? session.email;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-4">
        <Avatar seed={email} size={64} className="size-16" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
          <h1 className="font-serif text-3xl tracking-tight">Your account</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {user ? <EditProfile initial={user.onboarding} /> : null}

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Data</CardTitle>
          <CardDescription>Download your data as JSON anytime.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Link href="/api/me/export">
            <Button variant="outline">Download my data</Button>
          </Link>
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
