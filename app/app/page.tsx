import { ArrowRight, MessageCircle, NotebookPen, TrendingUp } from "lucide-react";
import Link from "next/link";

import { BadgesRow } from "@/components/widgets/badges-row";
import { MoodFace } from "@/components/widgets/mood-face";
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
import { computeBadges, computeStreak, encouragement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth/session";
import { CONDITIONS, GOALS } from "@/lib/onboarding/options";
import { getPlan, listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "A quiet night";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AppHome() {
  const session = await getCurrentUser();
  if (!session) return null;

  const user = await getUser(session.userId);
  if (!user) return null;

  const date = today();
  let plan = await getPlan(session.userId, date);
  let planError: string | null = null;
  if (!plan) {
    try {
      plan = await generateDailyPlan(session.userId, date);
    } catch (err) {
      planError = err instanceof Error ? err.message : "Couldn't generate today's plan";
    }
  }

  const [recentLogs, allLogs, recentPlans] = await Promise.all([
    listSymptomLogs(session.userId, { limit: 5 }),
    listSymptomLogs(session.userId, { limit: 500 }),
    listPlans(session.userId, { limit: 30 }),
  ]);

  const todayLogs = allLogs.filter((l) => l.timestamp.startsWith(date));
  const waterToday = todayLogs.filter((l) => l.symptomType === "water").length;
  const hydrationTarget = user.onboarding.body?.hydrationTargetGlasses ?? 8;
  const latestMoodLog = recentLogs.find((l) => l.symptomType === "mood");
  const moodRating = latestMoodLog?.severity ?? null;

  const planDone =
    plan != null &&
    plan.focusActions.length > 0 &&
    (plan.completedActionIds?.length ?? 0) === plan.focusActions.length;

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

  const message = encouragement({
    streak: streakDays,
    todayLogs: todayLogs.length,
    planDone,
    hydration: { glasses: waterToday, target: hydrationTarget },
  });

  const badges = computeBadges(allLogs, recentPlans);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
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

      {/* Hydration + mood */}
      <div className="grid gap-4 sm:grid-cols-2">
        <WaterBottle initialGlasses={waterToday} target={hydrationTarget} />
        <MoodFace rating={moodRating} />
      </div>

      {/* Today + quick log */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="space-y-1 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Today
              </CardDescription>
              <Link href="/app/plan">
                <Button variant="ghost" size="sm">
                  Open <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
            <CardTitle className="font-serif text-xl">
              {planDone
                ? "All three actions done — that's a full day."
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
                <p className="text-sm leading-relaxed text-foreground">
                  {plan.morningBriefing}
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {plan.focusActions.slice(0, 3).map((a) => {
                    const done = plan?.completedActionIds?.includes(a.id) ?? false;
                    return (
                      <li key={a.id} className="flex gap-2">
                        <span className={done ? "text-success" : "text-primary"}>·</span>
                        <span className={done ? "line-through" : ""}>{a.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : planError ? (
              <p className="text-sm text-muted-foreground">
                {planError}. Check the OpenAI key in your env, then refresh.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="space-y-1 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Recent
              </CardDescription>
              <Link href="/app/log">
                <Button variant="ghost" size="sm">
                  Log <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
            <CardTitle className="font-serif text-xl">Check-ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No logs yet. A 10-second check-in builds the pattern.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {recentLogs.map((log) => (
                  <li key={log.logId} className="flex items-center justify-between">
                    <span className="capitalize text-foreground">{log.symptomType}</span>
                    <span className="text-muted-foreground">
                      {log.severity ? `${log.severity}/5` : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <ShortcutCard
          href="/app/chat"
          icon={<MessageCircle className="size-5" />}
          title="Coach chat"
          description="Ask anything — meals, focus, sleep, mood."
        />
        <ShortcutCard
          href="/app/log"
          icon={<NotebookPen className="size-5" />}
          title="New log"
          description="Mood, energy, focus, or sleep in 10 seconds."
        />
        <ShortcutCard
          href="/app/insights"
          icon={<TrendingUp className="size-5" />}
          title="Weekly insights"
          description="Charts, KPIs, and what's been working."
        />
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
