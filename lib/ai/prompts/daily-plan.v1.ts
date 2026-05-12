/**
 * Versioned prompt for daily plan generation. Bumps to v2 when the structure
 * or guardrails change — old generations stay traceable via promptVersion on
 * stored plans.
 *
 * PlainTheory is a daily-life coaching companion. All AI output is general
 * coaching, never therapy, counseling, or medical advice.
 */

import type { Condition } from "@/lib/conditions";

export const DAILY_PLAN_PROMPT_VERSION = "daily-plan.v2";

export type DailyPlanContext = {
  date: string;
  focusAreas: Condition[];
  goals: string[];
  wakeTime?: string;
  sleepTime?: string;
  dietaryNotes?: string;
  dietaryPatterns?: string[];
  allergens?: string[];
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
};

export const DAILY_PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["morningBriefing", "focusActions", "routines", "watchFor", "reflectionPrompts"],
  properties: {
    morningBriefing: {
      type: "string",
      description: "Warm 60-90 word morning briefing tailored to the user's focus areas and goals.",
    },
    focusActions: {
      type: "array",
      minItems: 5,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "category", "text"],
        properties: {
          id: { type: "string" },
          category: {
            type: "string",
            enum: ["food", "movement", "hydration", "medication", "stress", "sleep"],
          },
          text: { type: "string" },
        },
      },
    },
    routines: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      description: "Exactly one morning routine and one evening routine, each with concrete steps tailored to the user's schedule and focus areas.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "time", "steps"],
        properties: {
          title: { type: "string", description: "e.g. Morning Routine, Evening Routine" },
          time: {
            anyOf: [{ type: "string", description: "HH:MM format" }, { type: "null" }],
          },
          steps: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
        },
      },
    },
    watchFor: {
      type: "string",
      description: "One pattern to notice today, framed gently.",
    },
    reflectionPrompts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
  },
};

export function buildDailyPlanPrompt(context: DailyPlanContext): {
  system: string;
  user: string;
} {
  const system = `You are PlainTheory — a calm, warm daily-life coaching companion. You are NOT a therapist, doctor, dietitian, or any kind of licensed professional. PlainTheory is general life coaching, not therapy, counseling, or medical care.

Your job: write a calm, specific, gentle daily plan covering food, routine, movement, mindset, and mood — grounded in the user's chosen focus areas, their goals, their rhythm, and any dietary notes they've shared.

Hard rules — never violate:
1. Never make medical claims, diagnoses, or recommend any medication, supplement, or specific brand.
2. Never act as a therapist, counselor, or doctor. If something serious comes up (mental-health crisis, medical symptoms, abuse), gently redirect: "this is a moment for a professional you trust."
3. Honor declared allergies and dietary patterns strictly — never suggest foods the user has said they avoid.
4. No diet or fitness prescriptions framed as "you must" — coaching is suggestions, not orders.
5. Tone: warm, plain language, present tense, concrete. Avoid hedging clichés ("just listen to your body"). Avoid jargon.

Output the JSON schema exactly. focusActions are 5–7 specific, concrete, doable-today tasks spread across the user's focus areas — never vague, never repetitive. Vary the categories. routines are exactly two entries — one Morning Routine and one Evening Routine — each with 3–5 concrete steps timed to the user's wake/sleep schedule. watchFor is one pattern to notice. reflectionPrompts are three short evening questions.

User's focus areas (the wellness topics they picked):
${context.focusAreas
  .map(
    (c) => `
## ${c.name}
${c.description}
Daily habits to suggest: ${c.recommendedDailyHabits.join("; ")}
Generally helpful: ${[...c.generallyHelpful.foods, ...c.generallyHelpful.activities].join(", ")}
Generally avoid: ${[...c.generallyHarmful.foods, ...c.generallyHarmful.activities].join(", ")}
`,
  )
  .join("\n")}`;

  const dietBlock = [
    context.dietaryPatterns?.length ? `Patterns: ${context.dietaryPatterns.join(", ")}.` : "",
    context.allergens?.length ? `Avoids: ${context.allergens.join(", ")}.` : "",
    context.dietaryNotes ? `Notes: ${context.dietaryNotes}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bodyBlock = [
    context.heightCm ? `${context.heightCm}cm` : "",
    context.weightKg ? `${context.weightKg}kg` : "",
    context.activityLevel ? `activity: ${context.activityLevel}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const user = `Today is ${context.date}.
Goals: ${context.goals.join(", ") || "(not specified)"}.
${context.wakeTime ? `Wake time: ${context.wakeTime}.` : ""} ${context.sleepTime ? `Sleep time: ${context.sleepTime}.` : ""}
${bodyBlock ? `Body context — ${bodyBlock}.` : ""}
${dietBlock ? `Dietary context — ${dietBlock}` : ""}

Generate today's plan. Strictly respect any food restrictions above. If you suggest exercise volumes or food portions, scale to the body and activity context.`;

  return { system, user };
}
