import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { getUser, isPlusUser } from "@/lib/db/user";

import type { Transaction } from "@/app/api/billing/transactions/route";
import { TransactionsView } from "./_components/transactions-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Billing & Invoices" };

function threeMonthsAgo(): number {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export default async function BillingPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  const user = await getUser(session.userId);
  if (!user) redirect("/sign-in");

  const isPlus = isPlusUser(user);
  const planLabel =
    user.subscriptionPlan === "plusMonthly"
      ? "Plus · Monthly"
      : user.subscriptionPlan === "plusYearly"
        ? "Plus · Yearly"
        : "Free";

  // Server-side prefetch for the default 3-month window.
  let initialTransactions: Transaction[] = [];
  if (user.stripeCustomerId) {
    try {
      const invoices = await stripe().invoices.list({
        customer: user.stripeCustomerId,
        limit: 100,
        created: { gte: threeMonthsAgo() },
      });
      initialTransactions = invoices.data.map((inv) => {
        const line = inv.lines.data[0];
        return {
          id: inv.id,
          number: inv.number ?? null,
          date: inv.created,
          periodStart: line?.period?.start ?? inv.period_start ?? inv.created,
          periodEnd: line?.period?.end ?? inv.period_end ?? inv.created,
          description: line?.description ?? inv.description ?? "PlainTheory subscription",
          amount: inv.amount_paid,
          currency: inv.currency,
          status: inv.status ?? "unknown",
          pdfUrl: inv.invoice_pdf ?? null,
        };
      });
    } catch {
      // Non-fatal — client will show empty state and can retry via filter.
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <header className="space-y-4">
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p>
            <h1 className="font-serif text-3xl tracking-tight">Billing & Invoices</h1>
          </div>
        </div>
      </header>

      <TransactionsView
        initialTransactions={initialTransactions}
        planLabel={planLabel}
        isPlus={isPlus}
      />
    </div>
  );
}
