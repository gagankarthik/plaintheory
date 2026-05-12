import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getPlan, savePlan, type FocusAction } from "@/lib/db/plans";

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().min(1).max(200),
  category: z
    .enum(["food", "movement", "hydration", "medication", "stress", "sleep"])
    .default("movement"),
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
  const plan = await getPlan(session.userId, today());
  if (!plan) {
    return NextResponse.json({ error: "no plan for today" }, { status: 404 });
  }
  const newAction: FocusAction = {
    id: `custom-${randomUUID()}`,
    category: parsed.data.category,
    text: parsed.data.text,
  };
  const updated = {
    ...plan,
    focusActions: [...plan.focusActions, newAction],
  };
  await savePlan(updated);
  return NextResponse.json({ action: newAction });
}

export async function DELETE(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const actionId = url.searchParams.get("id");
  if (!actionId) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  if (!actionId.startsWith("custom-")) {
    return NextResponse.json({ error: "only custom tasks can be deleted" }, { status: 400 });
  }
  const plan = await getPlan(session.userId, today());
  if (!plan) return NextResponse.json({ error: "no plan" }, { status: 404 });
  const updated = {
    ...plan,
    focusActions: plan.focusActions.filter((a) => a.id !== actionId),
    completedActionIds: (plan.completedActionIds ?? []).filter((id) => id !== actionId),
  };
  await savePlan(updated);
  return NextResponse.json({ ok: true });
}
