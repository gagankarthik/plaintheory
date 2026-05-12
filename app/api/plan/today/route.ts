import { NextResponse } from "next/server";

import { generateDailyPlan } from "@/lib/ai/daily-plan";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlan } from "@/lib/db/plans";

export const runtime = "nodejs";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const plan = await getPlan(session.userId, today());
  return NextResponse.json({ plan });
}

export async function POST() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const plan = await generateDailyPlan(session.userId, today());
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[plan] generation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 500 },
    );
  }
}
