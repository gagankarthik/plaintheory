import { getCurrentUser } from "@/lib/auth/session";
import { getUser } from "@/lib/db/user";

import { GoalsEditor } from "./_components/goals-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Goals</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          What you&rsquo;re working toward.
        </h1>
        <p className="text-sm text-muted-foreground">
          Change focus areas, goals, or dietary notes anytime — coaching adapts immediately.
        </p>
      </header>

      {user ? <GoalsEditor initial={user.onboarding} /> : null}
    </div>
  );
}
