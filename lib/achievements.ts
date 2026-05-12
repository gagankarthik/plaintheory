import type { DailyPlan } from "@/lib/db/plans";

type Log = { timestamp: string; symptomType: string };

export type BadgeIcon =
  | "flame"
  | "sun"
  | "sparkles"
  | "trophy"
  | "leaf"
  | "compass"
  | "heart";

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: BadgeIcon;
  earnedAt: string;
};

export type BadgeMeta = {
  id: string;
  label: string;
  description: string;
  icon: BadgeIcon;
};

export const ALL_BADGES: BadgeMeta[] = [
  { id: "first-checkin", label: "First step", description: "You logged your first check-in.", icon: "sparkles" },
  { id: "streak-3", label: "3-day streak", description: "Three days in a row of showing up.", icon: "flame" },
  { id: "streak-7", label: "Week strong", description: "Seven days in a row. Pattern is forming.", icon: "flame" },
  { id: "consistent-30", label: "Quietly consistent", description: "You've checked in across 30 different days.", icon: "trophy" },
  { id: "first-plan", label: "Plan generated", description: "Your first morning plan came together.", icon: "sun" },
  { id: "first-complete", label: "Three of three", description: "You completed every action on a daily plan.", icon: "heart" },
  { id: "complete-5", label: "Five complete days", description: "Five full plans, done.", icon: "leaf" },
  { id: "logs-50", label: "Fifty check-ins", description: "Half a hundred quick logs.", icon: "compass" },
];

const DAY_MS = 86_400_000;

function uniqueDays(logs: Log[]): Set<string> {
  return new Set(logs.map((l) => l.timestamp.slice(0, 10)));
}

export function computeStreak(logs: Log[]): number {
  const days = uniqueDays(logs);
  let count = 0;
  for (let i = 0; i < 90; i++) {
    const iso = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    if (days.has(iso)) count++;
    else if (i > 0) break;
  }
  return count;
}

/** Consecutive days with a fully completed daily plan (all actions done). */
export function computePlanStreak(plans: DailyPlan[]): number {
  const completedDates = new Set(
    plans
      .filter(
        (p) =>
          p.focusActions.length > 0 &&
          (p.completedActionIds?.length ?? 0) === p.focusActions.length,
      )
      .map((p) => p.date),
  );
  let count = 0;
  for (let i = 0; i < 90; i++) {
    const iso = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    if (completedDates.has(iso)) count++;
    else if (i > 0) break;
  }
  return count;
}

/** Longest streak across all habit completions (given as an array of {habitId, date} objects). */
export function computeBestHabitStreak(
  completions: Array<{ habitId: string; date: string }>,
): number {
  const byHabit = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!byHabit.has(c.habitId)) byHabit.set(c.habitId, new Set());
    byHabit.get(c.habitId)!.add(c.date);
  }
  let best = 0;
  for (const dates of byHabit.values()) {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const iso = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
      if (dates.has(iso)) count++;
      else if (i > 0) break;
    }
    if (count > best) best = count;
  }
  return best;
}

export function computeBadges(logs: Log[], plans: DailyPlan[]): Badge[] {
  const earned: Badge[] = [];
  const days = uniqueDays(logs);
  const totalLogs = logs.length;
  const totalPlans = plans.length;
  const completedPlans = plans.filter(
    (p) => (p.completedActionIds?.length ?? 0) === p.focusActions.length && p.focusActions.length > 0,
  );

  if (totalLogs > 0) {
    earned.push({
      id: "first-checkin",
      label: "First step",
      description: "You logged your first check-in.",
      icon: "sparkles",
      earnedAt: logs[logs.length - 1]?.timestamp ?? new Date().toISOString(),
    });
  }
  if (days.size >= 3 && computeStreak(logs) >= 3) {
    earned.push({
      id: "streak-3",
      label: "3-day streak",
      description: "Three days in a row of showing up.",
      icon: "flame",
      earnedAt: new Date().toISOString(),
    });
  }
  if (days.size >= 7 && computeStreak(logs) >= 7) {
    earned.push({
      id: "streak-7",
      label: "Week strong",
      description: "Seven days in a row. Pattern is forming.",
      icon: "flame",
      earnedAt: new Date().toISOString(),
    });
  }
  if (days.size >= 30) {
    earned.push({
      id: "consistent-30",
      label: "Quietly consistent",
      description: "You've checked in across 30 different days.",
      icon: "trophy",
      earnedAt: new Date().toISOString(),
    });
  }
  if (totalPlans >= 1) {
    earned.push({
      id: "first-plan",
      label: "Plan generated",
      description: "Your first morning plan came together.",
      icon: "sun",
      earnedAt: plans[0]?.generatedAt ?? new Date().toISOString(),
    });
  }
  if (completedPlans.length >= 1) {
    earned.push({
      id: "first-complete",
      label: "Three of three",
      description: "You completed every action on a daily plan.",
      icon: "heart",
      earnedAt: completedPlans[0]?.generatedAt ?? new Date().toISOString(),
    });
  }
  if (completedPlans.length >= 5) {
    earned.push({
      id: "complete-5",
      label: "Five complete days",
      description: "Five full plans, done.",
      icon: "leaf",
      earnedAt: new Date().toISOString(),
    });
  }
  if (totalLogs >= 50) {
    earned.push({
      id: "logs-50",
      label: "Fifty check-ins",
      description: "Half a hundred quick logs. The pattern is real now.",
      icon: "compass",
      earnedAt: new Date().toISOString(),
    });
  }
  return earned;
}

export function encouragement(args: {
  streak: number;
  todayLogs: number;
  planDone: boolean;
  hydration: { glasses: number; target: number };
}): string {
  if (args.planDone) return "All three actions done. That's a full day.";
  if (args.streak >= 7) return `${args.streak}-day streak. Patterns are forming.`;
  if (args.streak >= 3) return `${args.streak} days in a row. The compound is real.`;
  if (args.hydration.glasses >= args.hydration.target) return "Hydration handled. Nice.";
  if (args.todayLogs === 0) return "A quick check-in builds the pattern. 10 seconds.";
  return "One small thing at a time.";
}
