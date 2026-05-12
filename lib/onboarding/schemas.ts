import { z } from "zod";

import { CONDITIONS, GOALS, REGIONS } from "./options";

const regionValues = REGIONS.map((r) => r.value) as [string, ...string[]];
const conditionIds = CONDITIONS.map((c) => c.id) as [string, ...string[]];
const goalIds = GOALS.map((g) => g.id) as [string, ...string[]];

const CURRENT_YEAR = new Date().getFullYear();

export const aboutYouSchema = z.object({
  region: z.enum(regionValues, { message: "Pick your region" }),
  birthYear: z
    .number({ message: "Enter your birth year" })
    .int()
    .min(1900, "Enter a real year")
    .max(CURRENT_YEAR - 18, "PlainTheory is 18+ only"),
});
export type AboutYouInput = z.infer<typeof aboutYouSchema>;

export const conditionsSchema = z.object({
  conditions: z.array(z.enum(conditionIds)).min(1, "Pick at least one"),
});
export type ConditionsInput = z.infer<typeof conditionsSchema>;

export const medicationsSchema = z.object({
  medications: z.string().max(2000, "Keep it under 2000 characters").optional(),
});
export type MedicationsInput = z.infer<typeof medicationsSchema>;

export const routineSchema = z.object({
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick a wake time"),
  sleepTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick a sleep time"),
});
export type RoutineInput = z.infer<typeof routineSchema>;

export const goalsSchema = z.object({
  goals: z.array(z.enum(goalIds)).min(1, "Pick at least one"),
});
export type GoalsInput = z.infer<typeof goalsSchema>;

export const notificationsSchema = z.object({
  dailyPlan: z.boolean(),
  eveningReflection: z.boolean(),
  weeklyInsights: z.boolean(),
});
export type NotificationsInput = z.infer<typeof notificationsSchema>;

export const disclaimerSchema = z.object({
  accepted: z.boolean().refine((v) => v === true, {
    message: "Please accept the disclaimer to continue",
  }),
});
export type DisclaimerInput = z.infer<typeof disclaimerSchema>;

export const bodyMetricsSchema = z.object({
  heightCm: z.number().int().min(80).max(260).optional(),
  weightKg: z.number().int().min(20).max(300).optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very-active"])
    .optional(),
  hydrationTargetGlasses: z.number().int().min(1).max(20).optional(),
});

/** Loose schema for /api/onboarding PATCH — accepts any subset of fields. */
export const onboardingPatchSchema = z.object({
  region: z.enum(regionValues).optional(),
  birthYear: z.number().int().optional(),
  conditions: z.array(z.enum(conditionIds)).optional(),
  medications: z.string().max(2000).optional(),
  wakeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sleepTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  goals: z.array(z.enum(goalIds)).optional(),
  notifications: notificationsSchema.optional(),
  body: bodyMetricsSchema.optional(),
  step: z
    .enum([
      "about-you",
      "body",
      "conditions",
      "medications",
      "routine",
      "goals",
      "notifications",
      "disclaimer",
      "complete",
    ])
    .optional(),
});
