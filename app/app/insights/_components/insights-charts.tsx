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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type DayPoint = {
  date: string;
  label: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  sleep: number | null;
  logs: number;
};

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
