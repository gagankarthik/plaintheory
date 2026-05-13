import { Activity, Compass, FileDown, Flame, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import { ActivityRings } from "@/components/widgets/activity-rings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UpgradeGate } from "@/components/ui/upgrade-gate";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate, getLocalTzOffset, isLocalDay } from "@/lib/date";
import { getPlan, listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { FREE_PLAN_TASK_LIMIT, getUser, isPlusUser } from "@/lib/db/user";

import {
  ActivityChart,
  CheckinGraph,
  SimpleMoodChart,
  TrendChart,
  type CheckinActivity,
  type DayPoint,
} from "./_components/insights-charts";
import { WeeklyDigestCard } from "./_components/weekly-digest-card";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

function isoNDaysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

type Log = Awaited<ReturnType<typeof listSymptomLogs>>[number];

function localDateOf(log: Log): string {
  return log.localDate ?? log.timestamp.slice(0, 10);
}

function buildDailySeries(logs: Log[]): DayPoint[] {
  const series: DayPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => localDateOf(l) === iso);
    const avg = (type: string): number | null => {
      const filtered = dayLogs.filter((l) => l.symptomType === type && l.severity);
      if (filtered.length === 0) return null;
      return Number(
        (filtered.reduce((s, l) => s + (l.severity ?? 0), 0) / filtered.length).toFixed(1),
      );
    };
    series.push({
      date: iso,
      label: dayLabel(day),
      mood: avg("mood"),
      energy: avg("energy"),
      focus: avg("focus"),
      sleep: avg("sleep"),
      logs: dayLogs.length,
    });
  }
  return series;
}

function streak(logs: Log[]): number {
  const days = new Set(logs.map(localDateOf));
  let count = 0;
  for (let i = 0; i < 60; i++) {
    const iso = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    if (days.has(iso)) count++;
    else if (i > 0) break;
  }
  return count;
}

function buildContributionData(
  logs: Awaited<ReturnType<typeof listSymptomLogs>>,
  from: string,
  to: string,
): CheckinActivity[] {
  const countByDate = new Map<string, number>();
  for (const log of logs) {
    const date = localDateOf(log);
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }

  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  const result: CheckinActivity[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    const count = countByDate.get(date) ?? 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
    result.push({ date, count, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export const metadata = {
  title: "Insights",
  description: "Your weekly patterns — mood, energy, check-in streaks, and plan completion.",
};

export default async function InsightsPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const user = await getUser(session.userId);
  const isPlus = user ? isPlusUser(user) : false;

  const weekFrom = isoNDaysAgo(7);
  const yearFrom = isoNDaysAgo(364);
  const to = new Date().toISOString();
  const today = await getLocalDate();
  const tzOffset = await getLocalTzOffset();

  // Today's plan snapshot for the rings widget (rings respect free-tier task limit).
  const todayPlan = await getPlan(session.userId, today);

  // Free users get KPIs only — no heavy data fetch needed for the gate
  const [logs, yearLogs, plans] = isPlus
    ? await Promise.all([
        listSymptomLogs(session.userId, { from: weekFrom, to, limit: 500 }),
        listSymptomLogs(session.userId, { from: yearFrom, to, limit: 2000, newestFirst: false }),
        listPlans(session.userId, { from: weekFrom, to: to.slice(0, 10), limit: 14 }),
      ])
    : await Promise.all([
        listSymptomLogs(session.userId, { from: weekFrom, to, limit: 100 }),
        Promise.resolve([] as Awaited<ReturnType<typeof listSymptomLogs>>),
        listPlans(session.userId, { from: weekFrom, to: to.slice(0, 10), limit: 7 }),
      ]);

  const series = buildDailySeries(logs);
  const contributionData = buildContributionData(yearLogs, yearFrom, to.slice(0, 10));
  const moodLogs = logs.filter((l) => l.symptomType === "mood" && l.severity);
  const energyLogs = logs.filter((l) => l.symptomType === "energy" && l.severity);
  const avg = (arr: Log[]) =>
    arr.length === 0
      ? null
      : (arr.reduce((s, l) => s + (l.severity ?? 0), 0) / arr.length).toFixed(1);
  const moodAvg = avg(moodLogs);
  const energyAvg = avg(energyLogs);

  const actionsDone = plans.reduce(
    (sum, p) => sum + (p.completedActionIds?.length ?? 0),
    0,
  );
  const actionsTotal = plans.reduce((sum, p) => sum + p.focusActions.length, 0);
  const completionRate =
    actionsTotal === 0 ? 0 : Math.round((actionsDone / actionsTotal) * 100);

  // Today's ring values — respect free-tier task limit so rings match the home/plan view.
  const todayLogs = logs.filter((l) => isLocalDay(l, today, tzOffset));
  const waterToday = todayLogs.filter((l) => l.symptomType === "water").length;
  const hydrationTarget = user?.onboarding.body?.hydrationTargetGlasses ?? 8;
  const allTodayActions = todayPlan?.focusActions ?? [];
  const visibleTodayActions = isPlus
    ? allTodayActions
    : allTodayActions.slice(0, FREE_PLAN_TASK_LIMIT);
  const visibleTodayIds = new Set(visibleTodayActions.map((a) => a.id));
  const todayCompleted = isPlus
    ? (todayPlan?.completedActionIds?.length ?? 0)
    : (todayPlan?.completedActionIds ?? []).filter((id) => visibleTodayIds.has(id)).length;
  const todayPlanTotal = visibleTodayActions.length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Last 7 days
        </p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          A quiet weekly review.
        </h1>
      </div>

      <ActivityRings
        hydration={{ value: waterToday, target: hydrationTarget }}
        checkIns={{ value: todayLogs.length, target: 3 }}
        planActions={{ value: todayCompleted, target: todayPlanTotal || 1 }}
        serverDate={today}
      />

      <WeeklyDigestCard isPlus={isPlus} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Sparkles className="size-4" />}
          label="Mood avg"
          value={moodAvg ?? "Waiting"}
          hint={moodAvg ? `${moodLogs.length} logs` : "log a mood to start the pattern"}
          empty={moodAvg === null}
        />
        <Kpi
          icon={<Activity className="size-4" />}
          label="Energy avg"
          value={energyAvg ?? "Waiting"}
          hint={energyAvg ? `${energyLogs.length} logs` : "log energy to see the trend"}
          empty={energyAvg === null}
        />
        <Kpi
          icon={<Flame className="size-4" />}
          label="Check-in streak"
          value={streak(logs) > 0 ? `${streak(logs)}d` : "Day 0"}
          hint={streak(logs) > 0 ? "consecutive days" : "today's the start"}
          empty={streak(logs) === 0}
        />
        <Kpi
          icon={<Compass className="size-4" />}
          label="Plan completion"
          value={actionsTotal === 0 ? "Fresh" : `${completionRate}%`}
          hint={
            actionsTotal === 0
              ? "no plans yet this week"
              : `${actionsDone}/${actionsTotal} actions`
          }
          empty={actionsTotal === 0}
        />
      </div>

      {/* Mood trend — free users get the basic single-line chart; Plus gets the
          full multi-metric line. Heatmap stays Plus-only. */}
      {isPlus ? (
        <>
          <CheckinGraph data={contributionData} />
          <TrendChart data={series} />
        </>
      ) : (
        <>
          <SimpleMoodChart data={series} />
          <UpgradeGate
            title="Energy, focus, sleep + year heatmap"
            description="Plus adds the rest of the trend lines and the at-a-glance year-long activity heatmap."
            preview={
              <div className="space-y-3">
                <div className="h-24 w-full rounded-2xl border border-border/60 bg-card/40" />
                <div className="h-40 w-full rounded-2xl border border-border/60 bg-card/40" />
              </div>
            }
          />
        </>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {isPlus ? <ActivityChart data={series} /> : (
          <UpgradeGate
            title="Daily log breakdown"
            description="Bar chart of how often you've checked in each day. Available on Plus."
            preview={<div className="h-32 w-full rounded-2xl border border-border/60 bg-card/40" />}
          />
        )}
        <Card className="border-border/60">
          <CardContent className="space-y-4 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Quick wins
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">·</span>
                <span>
                  You logged on {series.filter((d) => d.logs > 0).length} of the last 7
                  days. Aim for 5+ to spot patterns.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">·</span>
                <span>
                  Plan completion is at {completionRate}%. Mark actions as you do them —
                  it&rsquo;s how the AI learns what fits.
                </span>
              </li>
            </ul>

            <div className="rounded-xl border border-border/60 bg-card/40 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Personal reflection PDF
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your last 30 days condensed into a calm, printable reflection — patterns, completion, mood and energy.
              </p>
              {isPlus ? (
                <Link href="/api/report" className="mt-2.5 inline-block">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileDown className="size-3.5" />
                    Download PDF
                  </Button>
                </Link>
              ) : (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" disabled>
                    <Lock className="size-3.5" />
                    Download PDF
                  </Button>
                  <Link href="/pricing">
                    <Button size="sm" className="gap-1.5">
                      <Sparkles className="size-3" />
                      Plus only
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  empty?: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <span className="text-xs uppercase tracking-[0.15em]">{label}</span>
        </div>
        <p
          className={`font-serif ${
            empty ? "text-2xl text-muted-foreground" : "text-3xl text-foreground"
          }`}
        >
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
