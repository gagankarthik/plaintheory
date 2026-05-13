import { randomUUID } from "node:crypto";

import { getConditions } from "@/lib/conditions";
import {
  savePlan,
  type DailyMeal,
  type DailyPlan,
  type DailyRoutine,
  type FocusAction,
} from "@/lib/db/plans";
import { getUser } from "@/lib/db/user";

import { openaiProvider } from "./openai";
import {
  DAILY_PLAN_PROMPT_VERSION,
  DAILY_PLAN_SCHEMA,
  buildDailyPlanPrompt,
} from "./prompts/daily-plan.v1";

type DailyPlanOutput = {
  morningBriefing: string;
  focusActions: Array<{ id: string; category: FocusAction["category"]; text: string }>;
  routines?: Array<{ title: string; time?: string; steps: string[] }>;
  meals?: Array<{ name: string; time?: string | null; foods: string[]; nutrients: string[] }>;
  watchFor: string;
  reflectionPrompts: string[];
};

/**
 * Generate today's plan for the user, persist it, and return it. Idempotent
 * via PLAN#<date> SK — calling twice on the same date overwrites.
 */
export async function generateDailyPlan(userId: string, date: string): Promise<DailyPlan> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const conditions = getConditions(user.onboarding.conditions ?? []);
  if (conditions.length === 0) {
    throw new Error("User has no focus areas configured");
  }

  const prompt = buildDailyPlanPrompt({
    date,
    focusAreas: conditions,
    goals: user.onboarding.goals ?? [],
    ...(user.onboarding.wakeTime ? { wakeTime: user.onboarding.wakeTime } : {}),
    ...(user.onboarding.sleepTime ? { sleepTime: user.onboarding.sleepTime } : {}),
    ...(user.onboarding.medications ? { dietaryNotes: user.onboarding.medications } : {}),
    ...(user.onboarding.dietaryPatterns
      ? { dietaryPatterns: user.onboarding.dietaryPatterns }
      : {}),
    ...(user.onboarding.allergens ? { allergens: user.onboarding.allergens } : {}),
    ...(user.onboarding.body?.heightCm ? { heightCm: user.onboarding.body.heightCm } : {}),
    ...(user.onboarding.body?.weightKg ? { weightKg: user.onboarding.body.weightKg } : {}),
    ...(user.onboarding.body?.activityLevel
      ? { activityLevel: user.onboarding.body.activityLevel }
      : {}),
  });

  const output = await openaiProvider.generateJson<DailyPlanOutput>(
    [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    {
      jsonSchema: DAILY_PLAN_SCHEMA,
      schemaName: "daily_plan_v1",
      temperature: 0.5,
    },
  );

  const focusActions: FocusAction[] = output.focusActions.map((a) => ({
    id: a.id || randomUUID(),
    category: a.category,
    text: a.text,
  }));

  const routines: DailyRoutine[] | undefined = output.routines?.map((r) => ({
    title: r.title,
    ...(r.time ? { time: r.time } : {}),
    steps: r.steps,
  }));

  const meals: DailyMeal[] | undefined = output.meals?.map((m) => ({
    name: m.name,
    ...(m.time ? { time: m.time } : {}),
    foods: m.foods,
    nutrients: m.nutrients,
  }));

  const plan: DailyPlan = {
    userId,
    date,
    generatedAt: new Date().toISOString(),
    model: process.env.OPENAI_MODEL_REASONING ?? "gpt-4o",
    promptVersion: DAILY_PLAN_PROMPT_VERSION,
    morningBriefing: output.morningBriefing,
    focusActions,
    ...(routines?.length ? { routines } : {}),
    ...(meals?.length ? { meals } : {}),
    watchFor: output.watchFor,
    reflectionPrompts: output.reflectionPrompts,
  };

  await savePlan(plan);
  return plan;
}
