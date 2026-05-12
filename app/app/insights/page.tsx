import { Activity, Compass, Flame, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { UpgradeGate } from "@/components/ui/upgrade-gate";
import { getCurrentUser } from "@/lib/auth/session";
import { listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

import { ActivityChart, CheckinGraph, TrendChart, type CheckinActivity, type DayPoint } from "./_components/insights-charts";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

function isoNDaysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

type Log = Awaited<ReturnType<typeof listSymptomLogs>>[number];

function buildDailySeries(logs: Log[]): DayPoint[] {
  const series: DayPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.timestamp.startsWith(iso));
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
  const days = new Set(logs.map((l) => l.timestamp.slice(0, 10)));
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
    const date = log.timestamp.slice(0, 10);
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
  const isPlus = !!(user?.subscriptionPlan || user?.stripeCustomerId);

  const weekFrom = isoNDaysAgo(7);
  const yearFrom = isoNDaysAgo(364);
  const to = new Date().toISOString();

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
      ? "—"
      : (arr.reduce((s, l) => s + (l.severity ?? 0), 0) / arr.length).toFixed(1);

  const actionsDone = plans.reduce(
    (sum, p) => sum + (p.completedActionIds?.length ?? 0),
    0,
  );
  const actionsTotal = plans.reduce((sum, p) => sum + p.focusActions.length, 0);
  const completionRate =
    actionsTotal === 0 ? 0 : Math.round((actionsDone / actionsTotal) * 100);

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Sparkles className="size-4" />}
          label="Mood avg"
          value={avg(moodLogs)}
          hint={`${moodLogs.length} logs`}
        />
        <Kpi
          icon={<Activity className="size-4" />}
          label="Energy avg"
          value={avg(energyLogs)}
          hint={`${energyLogs.length} logs`}
        />
        <Kpi
          icon={<Flame className="size-4" />}
          label="Check-in streak"
          value={`${streak(logs)}d`}
          hint="consecutive days"
        />
        <Kpi
          icon={<Compass className="size-4" />}
          label="Plan completion"
          value={`${completionRate}%`}
          hint={`${actionsDone}/${actionsTotal} actions`}
        />
      </div>

      {isPlus ? (
        <>
          <CheckinGraph data={contributionData} />
          <TrendChart data={series} />
        </>
      ) : (
        <UpgradeGate
          title="Activity graph & trend charts"
          description="See your check-in heatmap across the year and 7-day mood, energy, focus, and sleep trends. Available on Plus."
          preview={
            <div className="space-y-4">
              <div className="h-32 w-full rounded-2xl border border-border/60 bg-card/40" />
              <div className="h-48 w-full rounded-2xl border border-border/60 bg-card/40" />
            </div>
          }
        />
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {isPlus ? <ActivityChart data={series} /> : (
          <UpgradeGate
            title="Activity breakdown"
            description="Daily log counts and category breakdown. Available on Plus."
            preview={<div className="h-48 w-full rounded-2xl border border-border/60 bg-card/40" />}
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
              <li className="flex items-start gap-2">
                <span className="text-primary">·</span>
                <span>
                  Download your last 30 days as a{" "}
                  <a
                    href="/api/report"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    personal reflection PDF
                  </a>
                  .
                </span>
              </li>
            </ul>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
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
        <p className="font-serif text-3xl text-foreground">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
