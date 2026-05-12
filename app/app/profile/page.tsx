import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { ACTIVITY_LEVELS } from "@/lib/onboarding/options";
import { getUser } from "@/lib/db/user";

import { ProfileEditor } from "./_components/profile-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  if (!user) return null;
  const email = user.email;
  const activityLabel = ACTIVITY_LEVELS.find(
    (a) => a.id === user.onboarding.body?.activityLevel,
  )?.label;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center gap-4">
        <Avatar seed={email} size={72} className="size-18" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
          <h1 className="font-serif text-3xl tracking-tight">Your profile</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </header>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Snapshot</CardTitle>
          <CardDescription>What the coach knows about you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
          <Stat
            label="Height"
            value={user.onboarding.body?.heightCm ? `${user.onboarding.body.heightCm} cm` : "—"}
          />
          <Stat
            label="Weight"
            value={user.onboarding.body?.weightKg ? `${user.onboarding.body.weightKg} kg` : "—"}
          />
          <Stat label="Activity" value={activityLabel ?? "—"} />
          <Stat
            label="Hydration target"
            value={
              user.onboarding.body?.hydrationTargetGlasses
                ? `${user.onboarding.body.hydrationTargetGlasses} glasses`
                : "8 glasses (default)"
            }
          />
        </CardContent>
      </Card>

      <ProfileEditor initial={user.onboarding} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}
