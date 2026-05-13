import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  computeBestHabitStreak,
  computePlanStreak,
  computeStreak,
} from "@/lib/achievements";
import { listHabitCompletions, listHabits } from "@/lib/db/habits";
import { listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser, isPlusUser } from "@/lib/db/user";
import { WellnessSummary, type WellnessStats } from "@/lib/pdf/wellness-summary";

export const runtime = "nodejs";

function average(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!isPlusUser(user)) {
    return NextResponse.json(
      { error: "PDF export is a Plus feature.", upgrade: "/pricing" },
      { status: 402 },
    );
  }

  const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10);
  const [logs, plans, habits, habitCompletions] = await Promise.all([
    listSymptomLogs(session.userId, { limit: 2000, newestFirst: true }),
    listPlans(session.userId, { limit: 365 }),
    listHabits(session.userId),
    listHabitCompletions(session.userId, { from: yearAgo, to: new Date().toISOString().slice(0, 10) }),
  ]);

  const completedPlans = plans.filter(
    (p) =>
      p.focusActions.length > 0 &&
      (p.completedActionIds?.length ?? 0) === p.focusActions.length,
  );

  const moodLogs = logs.filter((l) => l.symptomType === "mood" && typeof l.severity === "number");
  const energyLogs = logs.filter((l) => l.symptomType === "energy" && typeof l.severity === "number");
  const focusLogs = logs.filter((l) => l.symptomType === "focus" && typeof l.severity === "number");

  const logsByTypeMap = new Map<string, number>();
  for (const l of logs) {
    logsByTypeMap.set(l.symptomType, (logsByTypeMap.get(l.symptomType) ?? 0) + 1);
  }
  const logsByType = [...logsByTypeMap.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const earliest = logs[logs.length - 1]?.timestamp ?? new Date().toISOString();
  const latest = logs[0]?.timestamp ?? new Date().toISOString();

  const stats: WellnessStats = {
    email: user.email,
    generatedAt: new Date().toISOString(),
    range: { from: earliest.slice(0, 10), to: latest.slice(0, 10) },
    totals: {
      logs: logs.length,
      plansCompleted: completedPlans.length,
      waterGlasses: logs.filter((l) => l.symptomType === "water").length,
      chatMessages: 0,
      habitsActive: habits.filter((h) => !h.archivedAt).length,
      habitCompletions: habitCompletions.length,
    },
    averages: {
      ...(average(moodLogs.map((l) => l.severity as number)) !== undefined
        ? { mood: average(moodLogs.map((l) => l.severity as number)) }
        : {}),
      ...(average(energyLogs.map((l) => l.severity as number)) !== undefined
        ? { energy: average(energyLogs.map((l) => l.severity as number)) }
        : {}),
      ...(average(focusLogs.map((l) => l.severity as number)) !== undefined
        ? { focus: average(focusLogs.map((l) => l.severity as number)) }
        : {}),
    },
    streaks: {
      currentCheckIn: computeStreak(logs),
      bestHabit: computeBestHabitStreak(habitCompletions),
      bestPlan: computePlanStreak(plans),
    },
    logsByType,
    recentLogs: logs.slice(0, 30).map((l) => ({
      date: l.timestamp,
      type: l.symptomType,
      ...(typeof l.severity === "number" ? { severity: l.severity } : {}),
      ...(l.notes ? { notes: l.notes } : {}),
    })),
  };

  const pdfBuffer = await renderToBuffer(<WellnessSummary stats={stats} />);
  const today = new Date().toISOString().slice(0, 10);

  // Cast Buffer to Uint8Array for the Response body type
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plaintheory-summary-${today}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
