import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { createFinanceEntry, listFinanceEntries } from "@/lib/db/finance";

export const runtime = "nodejs";

const Body = z.object({
  kind: z.enum(["expense", "earning", "savings"]),
  amount: z.number().positive().max(1_000_000_000),
  reason: z.string().min(1).max(120),
  bank: z.string().max(60).optional(),
  category: z.string().max(40).optional(),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const entries = await listFinanceEntries(session.userId, { limit: 500 });
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { kind, amount, reason, bank, category, occurredOn } = parsed.data;
  const entry = await createFinanceEntry({
    userId: session.userId,
    kind,
    amount: Math.round(amount * 100) / 100,
    reason: reason.trim(),
    // Fall back to the caller's local date (header/cookie), matching the rest
    // of the app's day-boundary handling — never the server's UTC date.
    occurredOn: occurredOn ?? (await getLocalDate()),
    ...(bank?.trim() ? { bank: bank.trim() } : {}),
    ...(category?.trim() ? { category: category.trim() } : {}),
  });
  return NextResponse.json({ entry });
}
