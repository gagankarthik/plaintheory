import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { setActionCompleted } from "@/lib/db/plans";

export const runtime = "nodejs";

const Body = z.object({
  actionId: z.string().min(1),
  done: z.boolean(),
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const plan = await setActionCompleted(
    session.userId,
    today(),
    parsed.data.actionId,
    parsed.data.done,
  );
  if (!plan) {
    return NextResponse.json({ error: "no plan for today" }, { status: 404 });
  }
  return NextResponse.json({ completedActionIds: plan.completedActionIds ?? [] });
}
