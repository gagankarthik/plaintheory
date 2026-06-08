"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  type Entry,
  type Period,
  byCategory,
  entriesInPeriod,
  groupByPeriod,
  money,
  periodLabel,
} from "../../_lib/compute";
import { CategoryDonut, StatTile, TrendBars } from "../../_components/shared";

const PERIODS: { value: Period; label: string; limit: number }[] = [
  { value: "day", label: "Daily", limit: 30 },
  { value: "month", label: "Monthly", limit: 12 },
  { value: "year", label: "Yearly", limit: 8 },
];

export function ReportsView({
  initialEntries,
  today,
}: {
  initialEntries: Entry[];
  today: string;
}) {
  const [period, setPeriod] = useState<Period>("month");
  const cfg = PERIODS.find((p) => p.value === period)!;

  // Contiguous, zero-filled window for the chart…
  const buckets = useMemo(
    () => groupByPeriod(initialEntries, period, { limit: cfg.limit, anchor: today }),
    [initialEntries, period, cfg.limit, today],
  );
  // …but the table only lists periods that actually had activity (keeps the
  // daily breakdown from being 30 mostly-empty rows).
  const activeBuckets = useMemo(() => buckets.filter((b) => b.count > 0), [buckets]);
  const hasData = activeBuckets.length > 0;

  // Totals across the visible range.
  const rangeTotals = useMemo(
    () =>
      buckets.reduce(
        (acc, b) => ({
          earning: acc.earning + b.earning,
          expense: acc.expense + b.expense,
          savings: acc.savings + b.savings,
          net: acc.net + b.net,
        }),
        { earning: 0, expense: 0, savings: 0, net: 0 },
      ),
    [buckets],
  );

  // Most recent bucket → category drill-down.
  const latest = buckets[buckets.length - 1];
  const latestCats = useMemo(
    () => (latest ? byCategory(entriesInPeriod(initialEntries, latest.key, period), "expense") : []),
    [initialEntries, latest, period],
  );

  const rangeLabel =
    period === "day" ? "last 30 days" : period === "month" ? "last 12 months" : "by year";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reports</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">The longer view.</h1>
        <p className="text-sm text-muted-foreground">
          Earnings against expenses, {rangeLabel}.
        </p>
      </div>

      {/* PERIOD TOGGLE */}
      <div className="inline-flex rounded-full border border-border/60 bg-card p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              period === p.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* RANGE TOTALS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Earnings"
          value={money(rangeTotals.earning)}
          icon={<ArrowUpRight className="size-4" />}
          tone="success"
        />
        <StatTile
          label="Expenses"
          value={money(rangeTotals.expense)}
          icon={<ArrowDownRight className="size-4" />}
          tone="destructive"
        />
        <StatTile
          label="Savings"
          value={money(rangeTotals.savings)}
          icon={<PiggyBank className="size-4" />}
          tone="info"
        />
        <StatTile
          label="Net"
          value={money(rangeTotals.net)}
          icon={<Wallet className="size-4" />}
          tone={rangeTotals.net >= 0 ? "success" : "destructive"}
        />
      </div>

      {/* TREND CHART */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {cfg.label} trend
          </p>
          {hasData ? (
            <TrendBars buckets={buckets} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing to chart yet — add a few entries.
            </p>
          )}
        </CardContent>
      </Card>

      {/* PER-PERIOD TABLE */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="border-b border-border/40 px-4 py-3 sm:px-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {cfg.label} breakdown
            </p>
          </div>
          {!hasData ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-5">
              No entries in this range yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium sm:px-5">Period</th>
                    <th className="px-4 py-2.5 text-right font-medium">In</th>
                    <th className="px-4 py-2.5 text-right font-medium">Out</th>
                    <th className="px-4 py-2.5 text-right font-medium sm:px-5">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {[...activeBuckets].reverse().map((b) => (
                    <tr key={b.key} className="border-b border-border/20 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground sm:px-5">
                        {periodLabel(b.key, period)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-success">
                        {money(b.earning)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-destructive">
                        {money(b.expense)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-medium tabular-nums sm:px-5",
                          b.net >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {money(b.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LATEST PERIOD CATEGORY DRILL-DOWN */}
      {latest ? (
        <CategoryDonut
          data={latestCats}
          total={latestCats.reduce((s, c) => s + c.value, 0)}
          title={`${periodLabel(latest.key, period)} — spending by category`}
          emptyLabel={`No expenses in ${periodLabel(latest.key, period)}.`}
        />
      ) : null}
    </div>
  );
}
