import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { setActionCompleted } from "@/lib/db/plans";

export const runtime = "nodejs";

const Body = z.object({
  actionId: z.string().min(1),
  done: z.boolean(),
  // Client sends the plan's local date so UTC-offset users don't hit the wrong day.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const date = parsed.data.date ?? new Date().toISOString().slice(0, 10);
  const plan = await setActionCompleted(
    session.userId,
    date,
    parsed.data.actionId,
    parsed.data.done,
  );
  if (!plan) {
    return NextResponse.json({ error: "no plan for today" }, { status: 404 });
  }
  return NextResponse.json({ completedActionIds: plan.completedActionIds ?? [] });
}
