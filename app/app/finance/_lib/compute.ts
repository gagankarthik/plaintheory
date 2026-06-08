/**
 * Pure helpers for the finance section — aggregation, grouping, formatting.
 * No React, no IO; safe to import from server or client components.
 */

export type FinanceKind = "expense" | "earning" | "savings";

export type Entry = {
  entryId: string;
  kind: FinanceKind;
  amount: number;
  reason: string;
  bank?: string;
  category?: string;
  occurredOn: string;
  createdAt: string;
};

export type Period = "day" | "month" | "year";

export type Totals = {
  earning: number;
  expense: number;
  savings: number;
  net: number;
};

const currencyFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(n: number): string {
  return currencyFmt.format(n);
}

/** Short form for chart axes / tight tiles — e.g. $1.2K. */
export function moneyCompact(n: number): string {
  return compactFmt.format(n);
}

export function totals(entries: Entry[]): Totals {
  let earning = 0;
  let expense = 0;
  let savings = 0;
  for (const e of entries) {
    if (e.kind === "earning") earning += e.amount;
    else if (e.kind === "expense") expense += e.amount;
    else savings += e.amount;
  }
  return { earning, expense, savings, net: earning - expense };
}

export function byCategory(
  entries: Entry[],
  kind: FinanceKind = "expense",
): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    if (e.kind !== kind) continue;
    const key = e.category?.trim() || "Uncategorized";
    map.set(key, (map.get(key) ?? 0) + e.amount);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function byBank(
  entries: Entry[],
): { label: string; in: number; out: number; total: number }[] {
  const map = new Map<string, { in: number; out: number }>();
  for (const e of entries) {
    const key = e.bank?.trim() || "Unassigned";
    const cur = map.get(key) ?? { in: 0, out: 0 };
    if (e.kind === "expense") cur.out += e.amount;
    else cur.in += e.amount;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([label, v]) => ({ label, ...v, total: v.in + v.out }))
    .sort((a, b) => b.total - a.total);
}

/** The period bucket key an entry falls into (used for grouping + labels). */
function periodKey(occurredOn: string, period: Period): string {
  // occurredOn is YYYY-MM-DD.
  if (period === "year") return occurredOn.slice(0, 4);
  if (period === "month") return occurredOn.slice(0, 7);
  return occurredOn;
}

export function periodLabel(key: string, period: Period): string {
  if (period === "year") return key;
  if (period === "month") {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type PeriodBucket = Totals & { key: string; label: string; count: number };

/** Step a period key forward/back by `delta` whole periods. */
function shiftPeriodKey(key: string, period: Period, delta: number): string {
  if (period === "year") return String(Number(key) + delta);
  if (period === "month") {
    const parts = key.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Group entries into period buckets (day / month / year), sorted oldest→newest.
 *
 * - `limit` keeps only the most recent N buckets.
 * - `anchor` (a YYYY-MM-DD date) zero-fills missing periods so the result is a
 *   contiguous calendar window ending at the anchor's period. With `limit` this
 *   yields exactly N consecutive periods (e.g. the real last 30 days), instead
 *   of only the days that happened to have activity.
 */
export function groupByPeriod(
  entries: Entry[],
  period: Period,
  opts: { limit?: number; anchor?: string } = {},
): PeriodBucket[] {
  const { limit, anchor } = opts;
  const map = new Map<string, { earning: number; expense: number; savings: number; count: number }>();
  for (const e of entries) {
    const key = periodKey(e.occurredOn, period);
    const cur = map.get(key) ?? { earning: 0, expense: 0, savings: 0, count: 0 };
    if (e.kind === "earning") cur.earning += e.amount;
    else if (e.kind === "expense") cur.expense += e.amount;
    else cur.savings += e.amount;
    cur.count += 1;
    map.set(key, cur);
  }

  const toBucket = (key: string): PeriodBucket => {
    const v = map.get(key) ?? { earning: 0, expense: 0, savings: 0, count: 0 };
    return {
      key,
      label: periodLabel(key, period),
      earning: v.earning,
      expense: v.expense,
      savings: v.savings,
      net: v.earning - v.expense,
      count: v.count,
    };
  };

  // Contiguous, zero-filled window ending at the anchor period.
  if (anchor && limit) {
    const anchorKey = periodKey(anchor, period);
    const keys: string[] = [];
    for (let i = limit - 1; i >= 0; i--) keys.push(shiftPeriodKey(anchorKey, period, -i));
    return keys.map(toBucket);
  }

  const buckets = [...map.keys()]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map(toBucket);
  if (limit && buckets.length > limit) return buckets.slice(buckets.length - limit);
  return buckets;
}

/** Entries that fall inside a given period key (for "current month" drill-downs). */
export function entriesInPeriod(entries: Entry[], key: string, period: Period): Entry[] {
  return entries.filter((e) => periodKey(e.occurredOn, period) === key);
}

export const KIND_META: Record<
  FinanceKind,
  { label: string; accent: string; chip: string; bar: string }
> = {
  expense: {
    label: "Expense",
    accent: "text-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/30",
    bar: "bg-destructive",
  },
  earning: {
    label: "Earning",
    accent: "text-success",
    chip: "bg-success/10 text-success border-success/30",
    bar: "bg-success",
  },
  savings: {
    label: "Savings",
    accent: "text-info",
    chip: "bg-info/10 text-info border-info/30",
    bar: "bg-info",
  },
};
