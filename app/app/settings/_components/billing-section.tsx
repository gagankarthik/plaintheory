"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "./manage-billing-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";
type TierKey = "plusMonthly" | "plusYearly";

const PLUS_FEATURES = [
  "Unlimited focus areas",
  "Unlimited chat",
  "Weekly insights & trends",
  "Personal reflection PDF",
  "All routines & watch-for prompts",
];

// ─── Upgrade picker (free users) ────────────────────────────────────────────

function UpgradePicker() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(false);

  const tierKey: TierKey = cycle === "yearly" ? "plusYearly" : "plusMonthly";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey, returnTo: "settings" }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start checkout. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cycle toggle */}
      <div className="flex w-fit items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
        {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCycle(c)}
            className={cn(
              "rounded-full px-4 py-1 text-sm font-medium transition-all",
              cycle === c
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "monthly" ? "Monthly" : "Yearly"}
            {c === "yearly" ? (
              <span className="ml-1.5 text-[10px] font-semibold text-success">Save 21%</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Price */}
      <div>
        <span className="font-serif text-3xl">{cycle === "yearly" ? "$15" : "$19"}</span>
        <span className="ml-1 text-sm text-muted-foreground">/ month</span>
        {cycle === "yearly" ? (
          <p className="mt-0.5 text-xs text-muted-foreground">billed $179 / yr</p>
        ) : null}
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {PLUS_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <Check className="size-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button onClick={handleUpgrade} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Redirecting…" : `Upgrade to Plus · ${cycle === "yearly" ? "Yearly" : "Monthly"}`}
      </Button>
    </div>
  );
}

// ─── Cancel confirmation dialog ──────────────────────────────────────────────

function CancelDialog({ planLabel }: { planLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json() as { canceled?: boolean; periodEnd?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Cancellation failed");

      const until = data.periodEnd
        ? new Date(data.periodEnd * 1000).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;

      toast.success(
        until
          ? `Subscription canceled. You keep Plus access until ${until}.`
          : "Subscription canceled.",
        { duration: 8000 },
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5">
          Cancel subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel {planLabel}?</DialogTitle>
          <DialogDescription>
            You&apos;ll keep all Plus features until the end of your current billing period. After
            that, your account reverts to Free and you&apos;ll lose access to routines, insights,
            and unlimited chat.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Keep my plan</Button>
          </DialogClose>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive border-destructive/30"
            disabled={loading}
            onClick={handleCancel}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Canceling…" : "Yes, cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export function BillingSection({
  subscriptionPlan,
  subscriptionStatus,
  planLabel,
}: {
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  planLabel: string;
}) {
  const isActive = !!subscriptionPlan && subscriptionStatus !== "canceled";
  const isCanceling = subscriptionStatus === "canceling";
  const isPastDue = subscriptionStatus === "past_due";

  if (!isActive) {
    return <UpgradePicker />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={isPastDue ? "destructive" : "success"} className="text-sm px-3 py-1">
          {planLabel}
        </Badge>
        {isCanceling ? (
          <Badge variant="warning">Canceling at period end</Badge>
        ) : null}
        {isPastDue ? (
          <Badge variant="destructive">Payment failed</Badge>
        ) : null}
      </div>

      {isPastDue ? (
        <p className="text-sm text-muted-foreground">
          Your last payment didn&apos;t go through. Update your payment method to keep your Plus
          access — Stripe will automatically retry the charge.
        </p>
      ) : isCanceling ? (
        <p className="text-sm text-muted-foreground">
          Your subscription is set to cancel at the end of this billing period. You still have full
          Plus access until then.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          You have full access to all Plus features. Cancel anytime — you&apos;ll keep access until
          the end of your billing period.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {isPastDue ? <ManageBillingButton label="Update payment method" /> : null}
        {!isCanceling && !isPastDue ? <CancelDialog planLabel={planLabel} /> : null}
      </div>
    </div>
  );
}
