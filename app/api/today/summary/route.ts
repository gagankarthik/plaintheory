import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate, isLocalDay } from "@/lib/date";
import { getPlan } from "@/lib/db/plans";
import { listHabitCompletions, listHabits } from "@/lib/db/habits";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { FREE_PLAN_TASK_LIMIT, getUser, isPlusUser } from "@/lib/db/user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const paramDate = params.get("date");
  const today = paramDate && ISO.test(paramDate) ? paramDate : await getLocalDate();

  const tzRaw = params.get("tz");
  const tzOffset = tzRaw != null ? parseInt(tzRaw, 10) : null;
  const safeTz = tzOffset !== null && !isNaN(tzOffset) ? tzOffset : null;

  // Query a 3-day UTC window so no log is missed regardless of timezone.
  const dayBefore = new Date(new Date(today + "T00:00:00Z").getTime() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const dayAfter = new Date(new Date(today + "T00:00:00Z").getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [user, logs, plan, habits, completions] = await Promise.all([
    getUser(session.userId),
    listSymptomLogs(session.userId, { from: dayBefore, to: dayAfter }),
    getPlan(session.userId, today),
    listHabits(session.userId),
    listHabitCompletions(session.userId, { from: today, to: today }),
  ]);

  const hydrationTarget = user?.onboarding.body?.hydrationTargetGlasses ?? 8;

  const todayLogs = logs.filter((l) => isLocalDay(l, today, safeTz));
  const waterCount = todayLogs.filter((l) => l.symptomType === "water").length;
  const checkInCount = todayLogs.length;

  const isPlus = user ? isPlusUser(user) : false;
  const allActions = plan?.focusActions ?? [];
  const visibleActions = isPlus ? allActions : allActions.slice(0, FREE_PLAN_TASK_LIMIT);
  const visibleIds = new Set(visibleActions.map((a) => a.id));
  const allCompleted = plan?.completedActionIds ?? [];
  const completedCount = isPlus
    ? allCompleted.length
    : allCompleted.filter((id) => visibleIds.has(id)).length;
  const totalActions = visibleActions.length;

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const habitsDone = completions.filter((c) => c.date === today).length;

  return NextResponse.json(
    {
      date: today,
      water: { count: waterCount, target: hydrationTarget },
      checkIns: { count: checkInCount },
      plan: { completed: completedCount, total: totalActions },
      habits: { done: habitsDone, total: activeHabits.length },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
