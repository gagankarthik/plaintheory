"use client";

import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import {
  type Entry,
  type FinanceKind,
  KIND_META,
  byCategory,
  entriesInPeriod,
  money,
} from "../_lib/compute";
import { AddEntryForm, CategoryDonut, EntryRow, StatTile } from "./shared";

const COPY: Record<
  FinanceKind,
  { title: string; blurb: string; tone: "destructive" | "success" | "info"; donut?: boolean }
> = {
  expense: {
    title: "Expenses",
    blurb: "Everything going out — what you bought and where it came from.",
    tone: "destructive",
    donut: true,
  },
  earning: {
    title: "Earnings",
    blurb: "Money coming in — salary, side income, anything received.",
    tone: "success",
    donut: true,
  },
  savings: {
    title: "Savings",
    blurb: "What you set aside — funds, deposits, anything tucked away.",
    tone: "info",
    donut: true,
  },
};

export function LedgerView({
  kind,
  initialEntries,
  today,
}: {
  kind: FinanceKind;
  initialEntries: Entry[];
  today: string;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const copy = COPY[kind];
  const meta = KIND_META[kind];

  const ofKind = useMemo(() => entries.filter((e) => e.kind === kind), [entries, kind]);

  const thisMonthKey = today.slice(0, 7);
  const monthTotal = useMemo(
    () => entriesInPeriod(ofKind, thisMonthKey, "month").reduce((s, e) => s + e.amount, 0),
    [ofKind, thisMonthKey],
  );
  const allTotal = useMemo(() => ofKind.reduce((s, e) => s + e.amount, 0), [ofKind]);
  const cats = useMemo(() => byCategory(ofKind, kind), [ofKind, kind]);

  const monthName = new Date(`${thisMonthKey}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{copy.title}</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">{copy.title}.</h1>
        <p className="text-sm text-muted-foreground">{copy.blurb}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile
          label={`${monthName}`}
          value={money(monthTotal)}
          hint="this month"
          icon={<span className={meta.accent}>●</span>}
          tone={copy.tone}
        />
        <StatTile
          label="All time"
          value={money(allTotal)}
          hint={`${ofKind.length} ${ofKind.length === 1 ? "entry" : "entries"}`}
          icon={<span className={meta.accent}>●</span>}
          tone={copy.tone}
        />
      </div>

      <AddEntryForm
        today={today}
        defaultKind={kind}
        lockKind
        onAdd={(e) => setEntries((prev) => [e, ...prev])}
      />

      {copy.donut && allTotal > 0 ? (
        <CategoryDonut
          data={cats}
          total={allTotal}
          title="By category"
          emptyLabel="No categories yet."
        />
      ) : null}

      <section className="space-y-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {copy.title} ({ofKind.length})
        </p>
        {ofKind.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/40">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nothing here yet — add your first {meta.label.toLowerCase()} above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {ofKind.map((e) => (
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
