import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { getPlan } from "@/lib/db/plans";
import { listHabitCompletions, listHabits } from "@/lib/db/habits";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

export const runtime = "nodejs";

/**
 * GET /api/today/summary?date=YYYY-MM-DD
 *
 * Returns today's ring/widget data. The client passes its local date as a
 * query param so the server uses the user's actual date, not a UTC guess.
 * Falls back to getLocalDate() (proxy-injected header) if param is absent.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const paramDate = request.nextUrl.searchParams.get("date");
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const today = paramDate && ISO.test(paramDate) ? paramDate : await getLocalDate();

  const [user, logs, plan, habits, completions] = await Promise.all([
    getUser(session.userId),
    listSymptomLogs(session.userId, { limit: 200 }),
    getPlan(session.userId, today),
    listHabits(session.userId),
    listHabitCompletions(session.userId, { from: today, to: today }),
  ]);

  const hydrationTarget = user?.onboarding.body?.hydrationTargetGlasses ?? 8;

  const todayLogs = logs.filter(
    (l) => (l.localDate ? l.localDate === today : l.timestamp.startsWith(today)),
  );
  const waterCount = todayLogs.filter((l) => l.symptomType === "water").length;
  const checkInCount = todayLogs.length;

  const completedCount = plan?.completedActionIds?.length ?? 0;
  const totalActions = plan?.focusActions.length ?? 0;

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const habitsDone = completions.filter((c) => c.date === today).length;

  return NextResponse.json({
    date: today,
    water: { count: waterCount, target: hydrationTarget },
    checkIns: { count: checkInCount },
    plan: { completed: completedCount, total: totalActions },
    habits: { done: habitsDone, total: activeHabits.length },
  });
}
