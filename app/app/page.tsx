import { ArrowRight, CalendarDays, MessageCircle, NotebookPen, TrendingUp } from "lucide-react";
import Link from "next/link";

import { ActivityRings } from "@/components/widgets/activity-rings";
import { BadgesRow } from "@/components/widgets/badges-row";
import { MoodFace } from "@/components/widgets/mood-face";
import { StreaksCard } from "@/components/widgets/streaks-card";
import { WaterBottle } from "@/components/widgets/water-bottle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateDailyPlan } from "@/lib/ai/daily-plan";
import {
  computeBadges,
  computeBestHabitStreak,
  computePlanStreak,
  computeStreak,
  encouragement,
} from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth/session";
import { CONDITIONS, GOALS } from "@/lib/onboarding/options";
import { getLocalDate } from "@/lib/date";
import { getPlan, listPlans } from "@/lib/db/plans";
import { listHabits, listHabitCompletions } from "@/lib/db/habits";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🥗",
  movement: "🏃",
  hydration: "💧",
  medication: "💊",
  stress: "🧘",
  sleep: "😴",
};

function greeting(): string {
  const hour = new Date().getHours();
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
  let plan = await getPlan(session.userId, date);
  let planError: string | null = null;
  if (!plan) {
    try {
      plan = await generateDailyPlan(session.userId, date);
    } catch (err) {
      planError = err instanceof Error ? err.message : "Couldn't generate today's plan";
    }
  }

  // Fetch 60 days of habit completions to compute best streak accurately
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10);

  const [recentLogs, allLogs, recentPlans, habits, habitCompletions, allHabitCompletions] =
    await Promise.all([
      listSymptomLogs(session.userId, { limit: 5 }),
      listSymptomLogs(session.userId, { limit: 500 }),
      listPlans(session.userId, { limit: 30 }),
      listHabits(session.userId),
      listHabitCompletions(session.userId, { from: date, to: date }),
      listHabitCompletions(session.userId, { from: sixtyDaysAgo, to: date }),
    ]);

  const todayLogs = allLogs.filter((l) => l.timestamp.startsWith(date));
  const waterToday = todayLogs.filter((l) => l.symptomType === "water").length;
  const hydrationTarget = user.onboarding.body?.hydrationTargetGlasses ?? 8;
  const latestMoodLog = recentLogs.find((l) => l.symptomType === "mood");
  const moodRating = latestMoodLog?.severity ?? null;

  const completedCount = plan?.completedActionIds?.length ?? 0;
  const totalActions = plan?.focusActions.length ?? 0;
  const planDone = plan != null && totalActions > 0 && completedCount === totalActions;

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const habitsDoneToday = habitCompletions.filter((c) => c.date === date).length;

  const firstName = (user.email.split("@")[0] ?? "there")
    .split(/[.\-_]/)[0]
    ?.replace(/\b\w/g, (c) => c.toUpperCase());

  const userFocusAreas = (user.onboarding.conditions ?? [])
    .map((id) => CONDITIONS.find((c) => c.id === id)?.label)
    .filter(Boolean) as string[];
  const userGoals = (user.onboarding.goals ?? [])
    .map((id) => GOALS.find((g) => g.id === id)?.label)
    .filter(Boolean) as string[];

  const streakDays = computeStreak(allLogs);
  const planStreak = computePlanStreak(recentPlans);
  const bestHabitStreak = computeBestHabitStreak(allHabitCompletions);
  const message = encouragement({
    streak: streakDays,
    todayLogs: todayLogs.length,
    planDone,
    hydration: { glasses: waterToday, target: hydrationTarget },
  });
  const badges = computeBadges(allLogs, recentPlans);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Greeting */}
      <section className="flex items-start gap-4">
        <Avatar seed={user.email} size={56} className="size-14 shrink-0 sm:size-16" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {greeting()}, {firstName ?? "there"}.
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {userFocusAreas.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {userFocusAreas.slice(0, 4).map((label) => (
                <Badge key={label} variant="primary" className="text-[10px]">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Main layout: coach content + rings sidebar */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: today's coach content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Today's Plan */}
          <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.08)]">
            <CardHeader className="space-y-1 px-6 pt-6 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Today · {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </CardDescription>
                <Link href="/app/plan">
                  <Button variant="ghost" size="sm">
                    Full plan <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="font-serif text-xl">
                {planDone
                  ? "All done — that's a full day."
                  : plan
                    ? "Your plan is ready."
                    : planError
                      ? "Plan unavailable."
                      : "Generating…"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {plan ? (
                <>
                  <p className="text-sm leading-relaxed text-foreground">{plan.morningBriefing}</p>
                  <ul className="space-y-2">
                    {plan.focusActions.map((a) => {
                      const done = plan?.completedActionIds?.includes(a.id) ?? false;
                      return (
                        <li key={a.id} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 text-base leading-none">
                            {CATEGORY_EMOJI[a.category] ?? "·"}
                          </span>
                          <span className={done ? "text-muted-foreground line-through" : "text-foreground"}>
                            {a.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {totalActions > 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{completedCount} of {totalActions} done</span>
                        <span>{Math.round((completedCount / totalActions) * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${Math.round((completedCount / totalActions) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : planError ? (
                <p className="text-sm text-muted-foreground">
                  {planError}. Check the OpenAI key in your env, then refresh.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Today's Routines */}
          {plan?.routines && plan.routines.length > 0 ? (
            <Card className="border-border/60">
              <CardHeader className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Today&rsquo;s Routines
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 px-6 pb-6 sm:grid-cols-2">
                {plan.routines.map((routine) => (
                  <div key={routine.title} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{routine.title}</p>
                      {routine.time ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {routine.time}
                        </span>
                      ) : null}
                    </div>
                    <ol className="space-y-1.5">
                      {routine.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="shrink-0 font-medium text-foreground/50">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Quick shortcuts */}
          <div className="grid gap-3 sm:grid-cols-3">
            <ShortcutCard
              href="/app/chat"
              icon={<MessageCircle className="size-5" />}
              title="Coach chat"
              description="Ask about meals, focus, sleep, mood."
            />
            <ShortcutCard
              href="/app/log"
              icon={<NotebookPen className="size-5" />}
              title="New log"
              description="Mood, energy, focus, or sleep."
            />
            <ShortcutCard
              href="/app/insights"
              icon={<TrendingUp className="size-5" />}
              title="Weekly insights"
              description="Charts and what's been working."
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Water — top for easy daily logging */}
          <WaterBottle key={date} initialGlasses={waterToday} target={hydrationTarget} />

          {/* Activity rings */}
          <ActivityRings
            hydration={{ value: waterToday, target: hydrationTarget }}
            checkIns={{ value: todayLogs.length, target: 3 }}
            planActions={{ value: completedCount, target: totalActions || 1 }}
          />

          {/* Streaks */}
          <StreaksCard
            checkInStreak={streakDays}
            planStreak={planStreak}
            bestHabitStreak={bestHabitStreak}
          />

          {/* Habits today */}
          {activeHabits.length > 0 ? (
            <Card className="border-border/60">
              <CardContent className="space-y-3 px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Habits today
                  </p>
                  <Link href="/app/habits">
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      All <ArrowRight className="size-2.5" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl">{habitsDoneToday}</span>
                  <span className="text-sm text-muted-foreground">/ {activeHabits.length} done</span>
                </div>
                <div className="space-y-1.5">
                  {activeHabits.slice(0, 4).map((h) => {
                    const done = habitCompletions.some((c) => c.habitId === h.habitId);
                    return (
                      <div key={h.habitId} className="flex items-center gap-2 text-sm">
                        <span
                          className={`size-2 shrink-0 rounded-full ${done ? "bg-success" : "bg-border"}`}
                        />
                        <span className={done ? "text-muted-foreground line-through" : "text-foreground"}>
                          {h.name}
                        </span>
                      </div>
                    );
                  })}
                  {activeHabits.length > 4 ? (
                    <p className="text-xs text-muted-foreground pl-4">
                      +{activeHabits.length - 4} more
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Mood */}
          <MoodFace rating={moodRating} />
        </div>
      </div>

      {/* Badges */}
      <BadgesRow earned={badges} />

      {userGoals.length > 0 ? (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="flex flex-wrap items-center gap-3 px-6 py-5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              You&rsquo;re working toward
            </span>
            <div className="flex flex-wrap gap-1.5">
              {userGoals.map((g) => (
                <Badge key={g} variant="outline" className="text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-border/60 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_24px_40px_-20px_rgb(0_0_0_/_0.08)]">
        <CardContent className="space-y-3 p-5">
          <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0">
          <span className="text-xs font-medium text-primary">
            Open <ArrowRight className="ml-1 inline size-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
