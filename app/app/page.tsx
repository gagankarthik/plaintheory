import { ArrowRight, CalendarDays, Check, Flame, Lock, Repeat } from "lucide-react";
import Link from "next/link";

import { BreakGlassWidget } from "./_components/break-glass-widget";
import { DailyDoneConfetti } from "./_components/daily-done-confetti";

import { ActivityRings } from "@/components/widgets/activity-rings";
import { WaterBottle } from "@/components/widgets/water-bottle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateDailyPlan } from "@/lib/ai/daily-plan";
import { computeStreak, encouragement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate, getLocalTzOffset, isLocalDay } from "@/lib/date";
import type { FocusAction } from "@/lib/db/plans";
import { getPlan } from "@/lib/db/plans";
import { listHabits, listHabitCompletions } from "@/lib/db/habits";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { FREE_PLAN_TASK_LIMIT, getUser, isPlusUser } from "@/lib/db/user";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<FocusAction["category"], string> = {
  food: "🥗",
  movement: "🏃",
  hydration: "💧",
  medication: "💊",
  stress: "🧘",
  sleep: "😴",
};

function greeting(tzOffsetMin: number | null): string {
  const localMs = Date.now() - (tzOffsetMin ?? 0) * 60_000;
  const hour = new Date(localMs).getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "A quiet night";
}

export default async function AppHome() {
  const session = await getCurrentUser();
  if (!session) return null;

  const user = await getUser(session.userId);
  if (!user) return null;

  const date = await getLocalDate();
  const tzOffset = await getLocalTzOffset();
  let plan = await getPlan(session.userId, date);
  let planError: string | null = null;
  if (!plan) {
    try {
      plan = await generateDailyPlan(session.userId, date);
    } catch (err) {
      planError = err instanceof Error ? err.message : "Couldn't generate today's plan";
    }
  }

  const [allLogs, habits, habitCompletions] = await Promise.all([
    listSymptomLogs(session.userId, { limit: 400 }),
    listHabits(session.userId),
    listHabitCompletions(session.userId, { from: date, to: date }),
  ]);

  const todayLogs = allLogs.filter((l) => isLocalDay(l, date, tzOffset));
  const waterToday = todayLogs.filter((l) => l.symptomType === "water").length;
  const hydrationTarget = user.onboarding.body?.hydrationTargetGlasses ?? 8;
  const streak = computeStreak(allLogs);

  const isPlus = isPlusUser(user);
  const calmMode = isPlus && user.preferences?.calmMode === true;
  const allFocusActions = plan?.focusActions ?? [];
  const visibleActions = isPlus ? allFocusActions : allFocusActions.slice(0, FREE_PLAN_TASK_LIMIT);
  const hiddenActionCount = isPlus ? 0 : Math.max(0, allFocusActions.length - visibleActions.length);
  const completedIds = plan?.completedActionIds ?? [];
  const visibleIds = new Set(visibleActions.map((a) => a.id));
  const completedCount = isPlus
    ? completedIds.length
    : completedIds.filter((id) => visibleIds.has(id)).length;
  const totalActions = visibleActions.length;
  const planDone = plan != null && totalActions > 0 && completedCount === totalActions;
  const pct = totalActions === 0 ? 0 : Math.round((completedCount / totalActions) * 100);

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const habitsDoneToday = habitCompletions.filter((c) => c.date === date).length;

  const firstName = (user.email.split("@")[0] ?? "there")
    .split(/[.\-_]/)[0]
    ?.replace(/\b\w/g, (c) => c.toUpperCase());

  const message = encouragement({
    streak,
    todayLogs: todayLogs.length,
    planDone,
    hydration: { glasses: waterToday, target: hydrationTarget },
  });

  // Inline plan-progress ring geometry
  const RING_R = 30;
  const RING_C = 2 * Math.PI * RING_R;
  const ringOffset = RING_C * (1 - pct / 100);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(80%_60%_at_50%_0%,oklch(0.5_0.075_145_/_0.10)_0%,transparent_70%)]"
      />

      <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
        <DailyDoneConfetti date={date} done={planDone && !calmMode} />

        {/* Greeting bar */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar seed={user.email} size={44} className="size-11 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-serif text-xl tracking-tight sm:text-2xl">
                {greeting(tzOffset)}, {firstName ?? "there"}.
              </h1>
            </div>
          </div>
          {!calmMode ? (
            <p className="hidden text-sm text-muted-foreground sm:block">{message}</p>
          ) : null}
        </section>

        {/* WIDGET GRID */}
        <div className="grid auto-rows-min grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* PLAN — anchor large widget */}
          <div className="col-span-2 lg:row-span-2">
            <div
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 sm:p-6",
                planDone
                  ? "border-success/30 bg-gradient-to-br from-success/12 via-success/4 to-transparent"
                  : "border-primary/20 bg-gradient-to-br from-primary/10 via-primary/4 to-transparent",
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Today &middot;{" "}
                      {new Date().toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {streak > 0 && !calmMode ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        <Flame className="size-2.5" />
                        {streak}d
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                    {planDone
                      ? "A full day."
                      : totalActions > 0
                        ? `${completedCount} of ${totalActions} done.`
                        : plan
                          ? "Your plan is ready."
                          : planError
                            ? "Plan unavailable."
                            : "Generating…"}
                  </p>
                </div>
                {totalActions > 0 ? (
                  <div className="relative size-16 shrink-0 sm:size-20">
                    <svg viewBox="0 0 80 80" className="size-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={RING_R}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="7"
                        opacity="0.5"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={RING_R}
                        fill="none"
                        stroke={planDone ? "var(--success)" : "var(--primary)"}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={RING_C}
                        strokeDashoffset={ringOffset}
                        className="transition-all duration-700 ease-out"
                        style={{
                          filter: `drop-shadow(0 0 8px ${planDone ? "var(--success)" : "var(--primary)"}40)`,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-serif text-base text-foreground sm:text-lg">
                        {pct}
                        <span className="text-[10px] text-muted-foreground">%</span>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Briefing */}
              {plan ? (
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.morningBriefing}
                </p>
              ) : planError ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {planError}. Check the OpenAI key in your env, then refresh.
                </p>
              ) : null}

              {/* Tasks preview */}
              {plan && visibleActions.length > 0 ? (
                <ul className="mt-5 space-y-1.5">
                  {visibleActions.slice(0, 4).map((a) => {
                    const done = completedIds.includes(a.id);
                    return (
                      <li key={a.id} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={cn(
                            "inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                            done
                              ? "bg-primary/15 text-primary"
                              : "border border-border bg-background",
                          )}
                        >
                          {done ? <Check className="size-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="text-base leading-none">
                          {CATEGORY_EMOJI[a.category] ?? "·"}
                        </span>
                        <span
                          className={cn(
                            "flex-1 truncate",
                            done ? "text-muted-foreground line-through" : "text-foreground",
                          )}
                        >
                          {a.text}
                        </span>
                      </li>
                    );
                  })}
                  {visibleActions.length > 4 ? (
                    <li className="pl-7 text-xs text-muted-foreground">
                      +{visibleActions.length - 4} more
                    </li>
                  ) : null}
                  {hiddenActionCount > 0 ? (
                    <li className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3 text-primary/70" />
                      <span>
                        +{hiddenActionCount} more on Plus
                      </span>
                    </li>
                  ) : null}
                </ul>
              ) : null}

              {/* Footer action */}
              <div className="mt-auto flex justify-end pt-5">
                <Link href="/app/plan">
                  <Button size="sm" className="gap-1.5">
                    Open the plan <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* RINGS — medium widget */}
          <ActivityRings
            hydration={{ value: waterToday, target: hydrationTarget }}
            checkIns={{ value: todayLogs.length, target: 3 }}
            planActions={{ value: completedCount, target: totalActions || 1 }}
            serverDate={date}
            className="col-span-2 rounded-3xl border-primary/15 bg-gradient-to-br from-background to-muted/30"
          />

          {/* WATER — full-width tile (under rings on desktop) */}
          <WaterBottle
            key={date}
            initialGlasses={waterToday}
            target={hydrationTarget}
            className="col-span-2 rounded-3xl"
          />

          {/* HABITS — full width */}
          {activeHabits.length > 0 ? (
            <div className="col-span-2 rounded-3xl border border-success/20 bg-gradient-to-br from-success/10 via-success/3 to-transparent p-4 sm:p-5 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-2xl bg-success/15 text-success">
                    <Repeat className="size-3.5" />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Habits today
                  </p>
                </div>
                <Link href="/app/habits">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    All <ArrowRight className="size-2.5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-serif text-3xl text-foreground sm:text-4xl">
                  {habitsDoneToday}
                  <span className="text-lg text-muted-foreground">
                    {" "}
                    / {activeHabits.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">done · keep the streak alive</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeHabits.slice(0, 6).map((h) => {
                  const done = habitCompletions.some((c) => c.habitId === h.habitId);
                  return (
                    <span
                      key={h.habitId}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                        done
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-border/60 bg-background text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          done ? "bg-success" : "bg-border",
                        )}
                      />
                      {h.name}
                    </span>
                  );
                })}
                {activeHabits.length > 6 ? (
                  <span className="inline-flex items-center rounded-full border border-border/40 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    +{activeHabits.length - 6} more
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* ROUTINES — full width, Plus only */}
          {isPlus && plan?.routines && plan.routines.length > 0 ? (
            <div className="col-span-2 rounded-3xl border border-border/60 bg-card p-5 sm:p-6 lg:col-span-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                </span>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Today&rsquo;s Routines
                </p>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {plan.routines.map((routine) => (
                  <div key={routine.title} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{routine.title}</p>
                      {routine.time ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {routine.time}
                        </span>
                      ) : null}
                    </div>
                    <ol className="space-y-1.5">
                      {routine.steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm leading-snug text-muted-foreground"
                        >
                          <span className="shrink-0 font-medium text-foreground/50">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* BREAK GLASS — emergency re-sync, at the very bottom */}
          <BreakGlassWidget />
        </div>
      </div>
    </div>
  );
}

