import { getCurrentUser } from "@/lib/auth/session";
import { listHabits, listHabitCompletions } from "@/lib/db/habits";

import { HabitsView } from "./_components/habits-view";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [habits, completions] = await Promise.all([
    listHabits(session.userId),
    listHabitCompletions(session.userId),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Habits</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Small daily things.
        </h1>
        <p className="text-sm text-muted-foreground">
          One repeatable action per habit. Mark it done — see the streak compound.
        </p>
      </div>
      <HabitsView initialHabits={habits} initialCompletions={completions} />
    </div>
  );
}
