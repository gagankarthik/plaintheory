import { getCurrentUser } from "@/lib/auth/session";
import { getUser, isPlusUser } from "@/lib/db/user";
import { displayName, planLabel } from "@/lib/user-display";

import { AccountHeader } from "../_components/account-header";
import { GoalsEditor } from "./_components/goals-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <AccountHeader
        name={displayName(user.email)}
        email={user.email}
        plan={planLabel(user.subscriptionPlan)}
        isPlus={isPlusUser(user)}
      />

      <div className="space-y-1">
        <h2 className="font-serif text-xl tracking-tight sm:text-2xl">
          Goals &amp; preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Focus areas, goals, schedule, and diet. The coach adapts the moment you save.
        </p>
      </div>

      <GoalsEditor initial={user.onboarding} />
    </div>
  );
}
