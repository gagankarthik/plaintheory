import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

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
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Goals</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Your goals & preferences.
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your focus areas, goals, schedule, and diet anytime — the coach adapts immediately.
        </p>
      </header>

      <GoalsEditor initial={user.onboarding} />
    </div>
  );
}
