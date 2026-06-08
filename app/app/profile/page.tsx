import { Activity, Droplet, Ruler, Weight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { ACTIVITY_LEVELS } from "@/lib/onboarding/options";
import { getUser, isPlusUser } from "@/lib/db/user";
import { displayName, planLabel } from "@/lib/user-display";

import { AccountHeader } from "../_components/account-header";
import { ProfileEditor } from "./_components/profile-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  if (!user) return null;

  const email = user.email;
  const isPlus = isPlusUser(user);
  const body = user.onboarding.body;
  const activityLabel = ACTIVITY_LEVELS.find((a) => a.id === body?.activityLevel)?.label;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <AccountHeader
        name={displayName(email)}
        email={email}
        plan={planLabel(user.subscriptionPlan)}
        isPlus={isPlus}
      />

      <Card className="border-border/60">
        <CardHeader className="px-6 pb-2 pt-6">
          <CardTitle className="text-lg">Snapshot</CardTitle>
          <CardDescription>What the coach knows about you right now.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-4">
          <Stat
            icon={<Ruler className="size-4" />}
            label="Height"
            value={body?.heightCm ? `${body.heightCm} cm` : "—"}
          />
          <Stat
            icon={<Weight className="size-4" />}
            label="Weight"
            value={body?.weightKg ? `${body.weightKg} kg` : "—"}
          />
          <Stat
            icon={<Activity className="size-4" />}
            label="Activity"
            value={activityLabel ?? "—"}
          />
          <Stat
            icon={<Droplet className="size-4" />}
            label="Hydration"
            value={
              body?.hydrationTargetGlasses
                ? `${body.hydrationTargetGlasses} glasses`
                : "8 (default)"
            }
          />
        </CardContent>
      </Card>

      <ProfileEditor initial={user.onboarding} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.15em]">{label}</p>
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
