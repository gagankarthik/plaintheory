"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
  type Activity,
} from "@/components/kibo-ui/contribution-graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CheckinActivity = Activity;

export type DayPoint = {
  date: string;
  label: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  sleep: number | null;
  logs: number;
};

/**
 * Free-tier 7-day mood line — a single, scannable trend so free users have
 * something to actually look at on this page. Plus unlocks the multi-metric
 * version (energy / focus / sleep) below.
 */
export function SimpleMoodChart({ data }: { data: DayPoint[] }) {
  const hasData = data.some((d) => d.mood !== null);
  return (
    <Card className="border-border/60">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-lg">Mood · last 7 days</CardTitle>
        <CardDescription>
          {hasData
            ? "How your mood has moved this week."
            : "Log a mood from /log and this chart fills in."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-6 sm:px-6">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "var(--primary)" }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendChart({ data }: { data: DayPoint[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-lg">7-day trend</CardTitle>
        <CardDescription>How your check-ins have moved.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-6 sm:px-6">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Energy"
                stroke="var(--info)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="focus"
                name="Focus"
                stroke="var(--success)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="sleep"
                name="Sleep"
                stroke="var(--warning)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityChart({ data }: { data: DayPoint[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-lg">Check-ins per day</CardTitle>
        <CardDescription>Consistency, not perfection.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-6 sm:px-6">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="logs" name="Logs" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CheckinGraph({ data }: { data: CheckinActivity[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-lg">Activity over time</CardTitle>
        <CardDescription>Every square is a day. Darker = more check-ins.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto px-6 pb-6">
        <ContributionGraph
          data={data}
          blockSize={13}
          blockRadius={3}
          blockMargin={3}
          fontSize={11}
          className="text-muted-foreground"
        >
          <ContributionGraphCalendar>
            {({ activity, dayIndex, weekIndex }) => (
              <g>
                <title>
                  {activity.count === 0
                    ? activity.date
                    : `${activity.date} · ${activity.count} check-in${activity.count === 1 ? "" : "s"}`}
                </title>
                <ContributionGraphBlock
                  activity={activity}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                  className={cn(
                    'data-[level="0"]:fill-muted',
                    'data-[level="1"]:fill-primary/30',
                    'data-[level="2"]:fill-primary/55',
                    'data-[level="3"]:fill-primary/80',
                    'data-[level="4"]:fill-primary',
                  )}
                />
              </g>
            )}
          </ContributionGraphCalendar>
          <ContributionGraphFooter className="mt-2 text-xs">
            <ContributionGraphTotalCount>
              {({ totalCount }) => (
                <span className="text-muted-foreground">
                  {totalCount} check-in{totalCount === 1 ? "" : "s"} tracked
                </span>
              )}
            </ContributionGraphTotalCount>
            <ContributionGraphLegend>
              {({ level }) => (
                <svg height={13} width={13}>
                  <title>{`Level ${level}`}</title>
                  <rect
                    className={cn(
                      'data-[level="0"]:fill-muted',
                      'data-[level="1"]:fill-primary/30',
                      'data-[level="2"]:fill-primary/55',
                      'data-[level="3"]:fill-primary/80',
                      'data-[level="4"]:fill-primary',
                    )}
                    data-level={level}
                    height={13}
                    rx={3}
                    ry={3}
                    width={13}
                  />
                </svg>
              )}
            </ContributionGraphLegend>
          </ContributionGraphFooter>
        </ContributionGraph>
      </CardContent>
    </Card>
  );
}
