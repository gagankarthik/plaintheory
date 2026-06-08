"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import {
  type Entry,
  byBank,
  byCategory,
  entriesInPeriod,
  groupByPeriod,
  money,
  totals,
} from "../_lib/compute";
import { AddEntryForm, BankBars, CategoryDonut, EntryRow, StatTile, TrendBars } from "./shared";

export function DashboardView({
  initialEntries,
  today,
}: {
  initialEntries: Entry[];
  today: string;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const all = useMemo(() => totals(entries), [entries]);

  // This month vs. all-time framing.
  const thisMonthKey = today.slice(0, 7);
  const monthEntries = useMemo(
    () => entriesInPeriod(entries, thisMonthKey, "month"),
    [entries, thisMonthKey],
  );
  const month = useMemo(() => totals(monthEntries), [monthEntries]);

  const monthBuckets = useMemo(
    () => groupByPeriod(entries, "month", { limit: 6, anchor: today }),
    [entries, today],
  );
  const categories = useMemo(() => byCategory(monthEntries, "expense"), [monthEntries]);
  const banks = useMemo(() => byBank(entries), [entries]);
  const recent = entries.slice(0, 6);

  const monthName = new Date(`${thisMonthKey}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Where the money goes.</h1>
        <p className="text-sm text-muted-foreground">
          A live picture of {monthName} and your running balance.
        </p>
      </div>

      <AddEntryForm today={today} onAdd={(e) => setEntries((prev) => [e, ...prev])} />

      {/* THIS MONTH */}
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{monthName}</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile
            label="Earnings"
            value={money(month.earning)}
            icon={<ArrowUpRight className="size-4" />}
            tone="success"
          />
          <StatTile
            label="Expenses"
            value={money(month.expense)}
            icon={<ArrowDownRight className="size-4" />}
            tone="destructive"
          />
          <StatTile
            label="Savings"
            value={money(month.savings)}
            icon={<PiggyBank className="size-4" />}
            tone="info"
          />
          <StatTile
            label="Net"
            value={money(month.net)}
            hint={month.net >= 0 ? "in the black" : "spending over income"}
            icon={<Wallet className="size-4" />}
            tone={month.net >= 0 ? "success" : "destructive"}
          />
        </div>
      </section>

      {/* TREND */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Last 6 months
            </p>
            <p className="text-xs text-muted-foreground">
              All-time net{" "}
              <span className={all.net >= 0 ? "text-success" : "text-destructive"}>
                {money(all.net)}
              </span>
            </p>
          </div>
          <TrendBars buckets={monthBuckets} />
        </CardContent>
      </Card>

      {/* BREAKDOWNS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryDonut
          data={categories}
          total={month.expense}
          title={`${monthName} spending by category`}
          emptyLabel="No expenses logged this month."
        />
        <BankBars data={banks} />
      </div>

      {/* RECENT */}
      <section className="space-y-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Recent activity
        </p>
        {recent.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/40">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nothing logged yet. Add your first entry above to start the picture.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((e) => (
              <EntryRow
                key={e.entryId}
                entry={e}
                onDelete={() => setEntries((prev) => prev.filter((x) => x.entryId !== e.entryId))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
