import { getCurrentWeekStart, type WeeklyDigest } from "@/lib/db/digests";
import { listHabitCompletions, listHabits } from "@/lib/db/habits";
import { listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

import { openaiProvider } from "./openai";

const DAY_MS = 86_400_000;
export const DIGEST_PROMPT_VERSION = "digest.v1";

const DIGEST_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "workingWell", "tryThis"],
  properties: {
    summary: {
      type: "string",
      description:
        "One short paragraph (2–3 sentences) describing how the user's week felt overall. Calm, specific, not clinical.",
    },
    workingWell: {
      type: "string",
      description:
        "One short paragraph naming patterns that seemed to work for them this week (e.g. 'days you logged water by lunchtime, mood ran a little higher'). Anchored to their actual data, never invented.",
    },
    tryThis: {
      type: "string",
      description:
        "One specific concrete suggestion for the coming week, framed as an invitation, not a prescription. One sentence.",
    },
  },
};

function average(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function band(v?: number): string {
  if (v === undefined) return "no data";
  if (v < 250) return "low";
  if (v < 500) return "below average";
  if (v < 750) return "okay";
  return "high";
}

export async function generateWeeklyDigest(
  userId: string,
  weekStart?: string,
): Promise<WeeklyDigest> {
  const week = weekStart ?? getCurrentWeekStart();
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");

  const fromIso = new Date(new Date(week + "T00:00:00Z").getTime()).toISOString();
  const toIso = new Date(new Date(week + "T00:00:00Z").getTime() + 7 * DAY_MS).toISOString();
  const fromDate = week;
  const toDate = toIso.slice(0, 10);

  const [logs, plans, habits, habitCompletions] = await Promise.all([
    listSymptomLogs(userId, { from: fromIso, to: toIso, limit: 1000, newestFirst: false }),
    listPlans(userId, { from: fromDate, to: toDate, limit: 14 }),
    listHabits(userId),
    listHabitCompletions(userId, { from: fromDate, to: toDate }),
  ]);

  const moodVals = logs
    .filter((l) => l.symptomType === "mood" && typeof l.severity === "number")
    .map((l) => l.severity as number);
  const energyVals = logs
    .filter((l) => l.symptomType === "energy" && typeof l.severity === "number")
    .map((l) => l.severity as number);
  const focusVals = logs
    .filter((l) => l.symptomType === "focus" && typeof l.severity === "number")
    .map((l) => l.severity as number);

  const checkInDays = new Set(
    logs.map((l) => l.localDate ?? l.timestamp.slice(0, 10)),
  ).size;

  const plansCompleted = plans.filter(
    (p) =>
      p.focusActions.length > 0 &&
      (p.completedActionIds?.length ?? 0) === p.focusActions.length,
  ).length;

  const waterTotal = logs.filter((l) => l.symptomType === "water").length;

  const stats: WeeklyDigest["stats"] = {
    checkInDays,
    plansCompleted,
    waterTotal,
    ...(average(moodVals) !== undefined ? { moodAvg: average(moodVals) } : {}),
    ...(average(energyVals) !== undefined ? { energyAvg: average(energyVals) } : {}),
    ...(average(focusVals) !== undefined ? { focusAvg: average(focusVals) } : {}),
  };

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const habitCompletionCount = habitCompletions.length;
  const recentNotes = logs
    .map((l) => l.notes?.trim())
    .filter((n): n is string => typeof n === "string" && n.length > 0)
    .slice(-5);

  const system = `You are PlainTheory writing a calm, observant weekly digest for a user — the way a thoughtful friend would summarize what they noticed about your week. PlainTheory is general life coaching, not therapy or medical advice.

Rules:
- Speak in second person ("you logged…", "your mood looked…").
- Be specific to the numbers. Never invent patterns that aren't in the data.
- Don't moralize or rank the week as "good" or "bad". Patterns, not judgments.
- One concrete suggestion only. No medical claims, no diet prescriptions.
- Plain, warm, human language. No "It seems like…" or "It's important to remember…".

Output JSON per the schema. Each field is one short paragraph.`;

  const userPrompt = `Week of ${week}.

Stats:
- Check-in days: ${checkInDays} of 7
- Mood (avg): ${stats.moodAvg ?? "no data"} (${band(stats.moodAvg)})
- Energy (avg): ${stats.energyAvg ?? "no data"} (${band(stats.energyAvg)})
- Focus (avg): ${stats.focusAvg ?? "no data"} (${band(stats.focusAvg)})
- Water glasses logged: ${waterTotal}
- Daily plans fully completed: ${plansCompleted}
- Active habits: ${activeHabits.length}, total habit completions this week: ${habitCompletionCount}
${recentNotes.length > 0 ? `\nRecent log notes from the user:\n${recentNotes.map((n) => `- "${n}"`).join("\n")}` : ""}

Focus areas: ${(user.onboarding.conditions ?? []).join(", ") || "not set"}.
Goals: ${(user.onboarding.goals ?? []).join(", ") || "not specified"}.

Write the digest.`;

  const output = await openaiProvider.generateJson<{
    summary: string;
    workingWell: string;
    tryThis: string;
  }>(
    [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
    {
      jsonSchema: DIGEST_SCHEMA,
      schemaName: "weekly_digest_v1",
      temperature: 0.5,
    },
  );

  return {
    userId,
    weekStart: week,
    generatedAt: new Date().toISOString(),
    model: process.env.OPENAI_MODEL_REASONING ?? "gpt-4o",
    summary: output.summary,
    workingWell: output.workingWell,
    tryThis: output.tryThis,
    stats,
  };
}
