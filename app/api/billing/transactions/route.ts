import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { getUser } from "@/lib/db/user";

export const runtime = "nodejs";

export type Transaction = {
  id: string;
  number: string | null;
  date: number;
  periodStart: number;
  periodEnd: number;
  description: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
};

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ transactions: [] });
  }

  const url = new URL(request.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const created: { gte?: number; lte?: number } = {};
  if (fromParam) {
    const d = new Date(fromParam + "T00:00:00Z");
    if (!isNaN(d.getTime())) created.gte = Math.floor(d.getTime() / 1000);
  }
  if (toParam) {
    const d = new Date(toParam + "T23:59:59Z");
    if (!isNaN(d.getTime())) created.lte = Math.floor(d.getTime() / 1000);
  }

  try {
    const invoices = await stripe().invoices.list({
      customer: user.stripeCustomerId,
      limit: 100,
      ...(Object.keys(created).length ? { created } : {}),
    });

    const transactions: Transaction[] = invoices.data
      // Only show paid invoices and ones where payment was attempted and failed.
      .filter((inv) => {
        if (inv.status === "paid") return true;
        // open + at least one charge attempt = payment is failing/retrying
        if (inv.status === "open" && (inv.attempt_count ?? 0) > 0) return true;
        // all retries exhausted
        if (inv.status === "uncollectible") return true;
        return false;
      })
      .map((inv) => {
        const line = inv.lines.data[0];
        const description =
          line?.description ??
          inv.description ??
          "PlainTheory subscription";

        // Normalise status into paid | failed for the UI
        const displayStatus =
          inv.status === "paid"
            ? "paid"
            : "failed";

        return {
          id: inv.id,
          number: inv.number ?? null,
          date: inv.created,
          periodStart: line?.period?.start ?? inv.period_start ?? inv.created,
          periodEnd: line?.period?.end ?? inv.period_end ?? inv.created,
          description,
          amount: inv.status === "paid" ? inv.amount_paid : inv.amount_due,
          currency: inv.currency,
          status: displayStatus,
          pdfUrl: inv.invoice_pdf ?? null,
        };
      });

    return NextResponse.json({ transactions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[billing/transactions]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
