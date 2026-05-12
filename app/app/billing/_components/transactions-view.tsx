"use client";

import { Download, FileText, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Transaction } from "@/app/api/billing/transactions/route";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPeriod(start: number, end: number): string {
  const s = new Date(start * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const e = new Date(end * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}

function statusVariant(status: string): "success" | "destructive" {
  return status === "paid" ? "success" : "destructive";
}

function statusLabel(status: string): string {
  return status === "paid" ? "Paid" : "Failed";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function threeMonthsAgoIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

// ─── date range filter ───────────────────────────────────────────────────────

function DateInput({
  label,
  value,
  max,
  min,
  onChange,
}: {
  label: string;
  value: string;
  max?: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          "[&::-webkit-calendar-picker-indicator]:opacity-50",
        )}
      />
    </label>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type Props = {
  initialTransactions: Transaction[];
  planLabel: string;
  isPlus: boolean;
};

export function TransactionsView({ initialTransactions, planLabel, isPlus }: Props) {
  const [from, setFrom] = useState(threeMonthsAgoIso());
  const [to, setTo] = useState(todayIso());
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);

  const fetch_ = async (f: string, t: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f) params.set("from", f);
      if (t) params.set("to", t);
      const res = await fetch(`/api/billing/transactions?${params}`);
      const data = await res.json() as { transactions?: Transaction[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setTransactions(data.transactions ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't load transactions");
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const currency = transactions[0]?.currency ?? "usd";

  return (
    <div className="space-y-6">
      {/* Plan badge */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={isPlus ? "success" : "outline"} className="text-sm px-3 py-1">
          {planLabel}
        </Badge>
        {isPlus ? (
          <span className="text-sm text-muted-foreground">Active subscription</span>
        ) : null}
      </div>

      {/* Date range filter */}
      <Card className="border-border/60">
        <CardContent className="px-5 py-4">
          <div className="flex flex-wrap items-end gap-4">
            <DateInput
              label="From"
              value={from}
              max={to || todayIso()}
              onChange={setFrom}
            />
            <DateInput
              label="To"
              value={to}
              min={from}
              max={todayIso()}
              onChange={setTo}
            />
            <Button
              onClick={() => void fetch_(from, to)}
              loading={loading}
              className="self-end"
            >
              Apply
            </Button>
            <button
              type="button"
              onClick={() => {
                const f = threeMonthsAgoIso();
                const t = todayIso();
                setFrom(f);
                setTo(t);
                void fetch_(f, t);
              }}
              className="self-end pb-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Last 3 months
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                const f = `${d.getFullYear()}-01-01`;
                const t = todayIso();
                setFrom(f);
                setTo(t);
                void fetch_(f, t);
              }}
              className="self-end pb-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              This year
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 1);
                const f = `${d.getFullYear()}-01-01`;
                const t = `${d.getFullYear()}-12-31`;
                setFrom(f);
                setTo(t);
                void fetch_(f, t);
              }}
              className="self-end pb-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Last year
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {transactions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-5 py-3">
          <span className="text-sm text-muted-foreground">
            {transactions.length} invoice{transactions.length !== 1 ? "s" : ""} in this period
          </span>
          <span className="font-serif text-xl text-foreground">
            {formatAmount(totalPaid, currency)}{" "}
            <span className="text-sm font-normal text-muted-foreground">total paid</span>
          </span>
        </div>
      ) : null}

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <Receipt className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground">
              Try a wider date range or check back after your first billing cycle.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop table header */}
          <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 sm:grid">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Description
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Amount
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </span>
            <span />
          </div>

          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── single row ───────────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  return (
    <Card className="border-border/60 transition-shadow hover:shadow-[0_2px_8px_0_rgb(0_0_0_/_0.06)]">
      <CardContent className="px-5 py-4">
        {/* Mobile layout */}
        <div className="flex items-start justify-between gap-3 sm:hidden">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatPeriod(tx.periodStart, tx.periodEnd)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-serif text-base text-foreground">
              {formatAmount(tx.amount, tx.currency)}
            </span>
            <Badge variant={statusVariant(tx.status)} className="text-[10px]">
              {statusLabel(tx.status)}
            </Badge>
            {tx.pdfUrl ? (
              <a
                href={tx.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <Download className="size-3" />
                PDF
              </a>
            ) : null}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 sm:grid">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(tx.date)} · {formatPeriod(tx.periodStart, tx.periodEnd)}
            </p>
          </div>

          <span className="font-serif text-base text-foreground">
            {formatAmount(tx.amount, tx.currency)}
          </span>

          <Badge variant={statusVariant(tx.status)} className="text-[10px]">
            {statusLabel(tx.status)}
          </Badge>

          {tx.pdfUrl ? (
            <a
              href={tx.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Download className="size-3" />
              Invoice
            </a>
          ) : (
            <span />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
