"use client";

import { Landmark, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  type Entry,
  type FinanceKind,
  type PeriodBucket,
  KIND_META,
  money,
  moneyCompact,
} from "../_lib/compute";

// Donut / legend palette — cycled in order.
export const SLICE_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "var(--destructive)",
  "oklch(0.6 0.12 300)",
  "oklch(0.65 0.13 200)",
  "oklch(0.7 0.14 60)",
];

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: "success" | "destructive" | "info" | "primary";
}) {
  const toneClass = {
    success: "border-success/20 from-success/10 text-success",
    destructive: "border-destructive/20 from-destructive/10 text-destructive",
    info: "border-info/20 from-info/10 text-info",
    primary: "border-primary/20 from-primary/10 text-primary",
  }[tone];
  return (
    <div className={cn("rounded-3xl border bg-gradient-to-br to-transparent p-4 sm:p-5", toneClass)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.22em]">
          {label}
        </p>
        <span className="opacity-80">{icon}</span>
      </div>
      <p className="mt-2 font-serif text-xl tracking-tight text-foreground sm:text-3xl">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function CategoryDonut({
  data,
  total,
  title = "Spending by category",
  emptyLabel = "No expenses logged yet.",
}: {
  data: { label: string; value: number }[];
  total: number;
  title?: string;
  emptyLabel?: string;
}) {
  const R = 56;
  const C = 2 * Math.PI * R;

  const segments = data.reduce<
    { label: string; value: number; len: number; offset: number }[]
  >((acc, slice) => {
    const prev = acc[acc.length - 1];
    const start = prev ? prev.offset + prev.len : 0;
    const len = total === 0 ? 0 : (slice.value / total) * C;
    acc.push({ label: slice.label, value: slice.value, len, offset: start });
    return acc;
  }, []);

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative size-40 shrink-0">
              <svg viewBox="0 0 140 140" className="size-full -rotate-90">
                {segments.map((seg, i) => (
                  <circle
                    key={seg.label}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={SLICE_COLORS[i % SLICE_COLORS.length]}
                    strokeWidth="16"
                    strokeDasharray={`${seg.len} ${C - seg.len}`}
                    strokeDashoffset={-seg.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Total
                </span>
                <span className="font-serif text-lg text-foreground">{money(total)}</span>
              </div>
            </div>
            <ul className="w-full space-y-1.5">
              {data.slice(0, 6).map((slice, i) => (
                <li key={slice.label} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {Math.round((slice.value / total) * 100)}%
                  </span>
                  <span className="w-20 shrink-0 text-right tabular-nums text-foreground">
                    {money(slice.value)}
                  </span>
                </li>
              ))}
              {data.length > 6 ? (
                <li className="pl-[1.125rem] text-xs text-muted-foreground">
                  +{data.length - 6} more categories
                </li>
              ) : null}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BankBars({
  data,
}: {
  data: { label: string; in: number; out: number; total: number }[];
}) {
  const max = data.reduce((m, d) => Math.max(m, d.total), 0);
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activity by bank</p>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No activity logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.slice(0, 7).map((b) => (
              <li key={b.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Landmark className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground">{b.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-xs">
                    <span className="text-success">+{money(b.in)}</span>{" "}
                    <span className="text-destructive">−{money(b.out)}</span>
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="bg-success" style={{ width: `${max ? (b.in / max) * 100 : 0}%` }} />
                  <div
                    className="bg-destructive"
                    style={{ width: `${max ? (b.out / max) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Grouped earning-vs-expense bars across period buckets (the reports trend chart). */
export function TrendBars({ buckets }: { buckets: PeriodBucket[] }) {
  const max = buckets.reduce((m, b) => Math.max(m, b.earning, b.expense), 0) || 1;
  if (buckets.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nothing to chart yet — add a few entries.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 overflow-x-auto pb-2 sm:gap-3">
        {buckets.map((b) => (
          <div key={b.key} className="flex min-w-[44px] flex-1 flex-col items-center gap-1.5">
            <div className="flex h-40 w-full items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[18px] rounded-t-md bg-success transition-all"
                style={{ height: `${Math.max(2, (b.earning / max) * 100)}%` }}
                title={`Earnings ${money(b.earning)}`}
              />
              <div
                className="w-1/2 max-w-[18px] rounded-t-md bg-destructive transition-all"
                style={{ height: `${Math.max(2, (b.expense / max) * 100)}%` }}
                title={`Expenses ${money(b.expense)}`}
              />
            </div>
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-success" /> Earnings
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive" /> Expenses
        </span>
        <span className="ml-auto hidden sm:inline">Top of axis · {moneyCompact(max)}</span>
      </div>
    </div>
  );
}

export function EntryRow({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const [pending, startTransition] = useTransition();
  const meta = KIND_META[entry.kind];
  const signed = entry.kind === "expense" ? `−${money(entry.amount)}` : `+${money(entry.amount)}`;

  const remove = () => {
    if (!confirm(`Delete "${entry.reason}"?`)) return;
    startTransition(async () => {
      const res = await fetch(
        `/api/finance/${entry.entryId}?createdAt=${encodeURIComponent(entry.createdAt)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        onDelete();
        toast.success("Deleted.");
      } else {
        toast.error("Couldn't delete.");
      }
    });
  };

  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            meta.chip,
          )}
        >
          {meta.label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{entry.reason}</p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.occurredOn}
            {entry.category ? ` · ${entry.category}` : ""}
            {entry.bank ? ` · ${entry.bank}` : ""}
          </p>
        </div>
        <span className={cn("shrink-0 font-serif text-base tabular-nums", meta.accent)}>
          {signed}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete entry"
        >
          <Trash2 className="size-4" />
        </button>
      </CardContent>
    </Card>
  );
}

export function AddEntryForm({
  today,
  defaultKind,
  lockKind = false,
  onAdd,
}: {
  today: string;
  defaultKind?: FinanceKind;
  /** When set, hides the kind selector (used on the per-kind ledger pages). */
  lockKind?: boolean;
  onAdd: (entry: Entry) => void;
}) {
  const [kind, setKind] = useState<FinanceKind>(defaultKind ?? "expense");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [bank, setBank] = useState("");
  const [category, setCategory] = useState("");
  const [occurredOn, setOccurredOn] = useState(today);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (!reason.trim()) {
      toast.error(kind === "expense" ? "What did you buy?" : "Add a short note (source / reason).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          amount: amt,
          reason: reason.trim(),
          bank: bank.trim() || undefined,
          category: category.trim() || undefined,
          occurredOn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save entry");
      onAdd(data.entry as Entry);
      setAmount("");
      setReason("");
      setCategory("");
      toast.success("Entry added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {lockKind ? `Add ${KIND_META[kind].label.toLowerCase()}` : "Add an entry"}
        </p>

        {!lockKind ? (
          <div className="flex gap-1.5">
            {(["expense", "earning", "savings"] as FinanceKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                  kind === k
                    ? KIND_META[k].chip
                    : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {KIND_META[k].label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />
          <Input
            type="date"
            value={occurredOn}
            max={today}
            onChange={(e) => setOccurredOn(e.target.value)}
          />
        </div>

        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            kind === "expense"
              ? "What did you buy? (e.g. Weekly groceries)"
              : kind === "earning"
                ? "Source (e.g. June paycheck)"
                : "Note (e.g. Emergency fund)"
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. Food, Rent, Salary)"
          />
          <Input
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Bank / account (e.g. Chase)"
          />
        </div>

        <Button onClick={submit} loading={saving} className="w-full sm:w-auto">
          <Plus className="size-4" /> Add {lockKind ? KIND_META[kind].label.toLowerCase() : "entry"}
        </Button>
      </CardContent>
    </Card>
  );
}
