import type {
  ActivityLevelId,
  AllergenId,
  ConditionId,
  DietaryPatternId,
  GoalId,
  RegionId,
} from "./options";

export type BodyMetrics = {
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevelId;
  hydrationTargetGlasses?: number;
};

export const STEP_ORDER = [
  "about-you",
  "conditions",
  "medications",
  "routine",
  "goals",
  "notifications",
  "disclaimer",
] as const;

export type StepId = (typeof STEP_ORDER)[number];

export const STEP_META: Record<StepId, { title: string; description: string }> = {
  "about-you": {
    title: "A little about you",
    description: "Where you are and your year of birth. PlainTheory is 18+ only.",
  },
  conditions: {
    title: "Areas you'd like to grow in",
    description: "Pick a few. Your daily plan will weave around these.",
  },
  medications: {
    title: "How you like to eat",
    description:
      "Anything we should keep in mind — patterns, preferences, allergies. Optional, never required.",
  },
  routine: {
    title: "Your daily rhythm",
    description: "Approximate wake and sleep times. We'll align prompts to your day.",
  },
  goals: {
    title: "What good looks like",
    description: "The things you'd like more of. We'll track patterns toward them.",
  },
  notifications: {
    title: "How we stay in touch",
    description: "All optional. You can change these anytime in settings.",
  },
  disclaimer: {
    title: "Before we begin",
    description: "One last thing — how PlainTheory works.",
  },
};

export type NotificationPrefs = {
  dailyPlan: boolean;
  eveningReflection: boolean;
  weeklyInsights: boolean;
};

/**
 * Note: `conditions` is a legacy field name — it stores focus-area IDs.
 * `medications` is the legacy field name — it now holds free-text dietary
 * notes (allergies, preferences, things to avoid). Both kept for storage
 * compatibility; UI labels say "focus areas" and "dietary notes".
 */
export type OnboardingState = {
  step: StepId | "complete";
  region?: RegionId;
  birthYear?: number;
  conditions?: ConditionId[];
  medications?: string;
  dietaryPatterns?: DietaryPatternId[];
  allergens?: AllergenId[];
  wakeTime?: string;
  sleepTime?: string;
  goals?: GoalId[];
  notifications?: NotificationPrefs;
  disclaimerAcceptedAt?: string;
  body?: BodyMetrics;
};

export function isComplete(state: OnboardingState): boolean {
  return state.step === "complete";
}

export function nextStep(current: StepId): StepId | "complete" {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1 || idx === STEP_ORDER.length - 1) return "complete";
  return STEP_ORDER[idx + 1] as StepId;
}

export function prevStep(current: StepId): StepId | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return STEP_ORDER[idx - 1] as StepId;
}
