import { NextResponse } from "next/server";

import { generateDailyPlan } from "@/lib/ai/daily-plan";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { getPlan } from "@/lib/db/plans";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const date = await getLocalDate();
  const plan = await getPlan(session.userId, date);
  return NextResponse.json({ plan });
}

export async function POST() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const date = await getLocalDate();
    const plan = await generateDailyPlan(session.userId, date);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[plan] generation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 500 },
    );
  }
}
