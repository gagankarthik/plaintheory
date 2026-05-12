/**
 * Curated lists driving the onboarding wizard. PlainTheory is a daily-life
 * coaching companion — these are general wellness focus areas and goals,
 * not medical conditions.
 */

export const REGIONS = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
] as const;

export type RegionId = (typeof REGIONS)[number]["value"];

/**
 * The `CONDITION_*` and `Condition*` names are legacy from before the pivot;
 * the content is now focus areas. Internal-only — UI says "focus areas".
 */
export const CONDITION_CLUSTERS = [
  { id: "rhythm", label: "Your daily rhythm" },
  { id: "body", label: "Body & energy" },
  { id: "mind", label: "Mind & life" },
] as const;

export type ClusterId = (typeof CONDITION_CLUSTERS)[number]["id"];

export const CONDITIONS = [
  { id: "mornings", label: "Mindful mornings", cluster: "rhythm" },
  { id: "focus", label: "Steady energy & focus", cluster: "rhythm" },
  { id: "sleep", label: "Restful sleep", cluster: "rhythm" },
  { id: "movement", label: "Move more", cluster: "body" },
  { id: "nutrition", label: "Mindful eating", cluster: "body" },
  { id: "mood", label: "Mood awareness", cluster: "body" },
  { id: "stress", label: "Less stress", cluster: "mind" },
  { id: "learning", label: "Continuous learning", cluster: "mind" },
  { id: "relationships", label: "Stronger relationships", cluster: "mind" },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];

export const GOALS = [
  { id: "better-sleep", label: "Better sleep" },
  { id: "more-energy", label: "More steady energy" },
  { id: "less-stress", label: "Less stress" },
  { id: "stronger-body", label: "Stronger body" },
  { id: "balanced-mood", label: "More balanced mood" },
  { id: "deeper-focus", label: "Deeper focus" },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

/**
 * Common dietary patterns + allergens. User-disclosed only — used by the AI
 * to avoid suggesting things they avoid. Never used to make medical claims.
 */
export const DIETARY_PATTERNS = [
  { id: "omnivore", label: "No restrictions" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "low-carb", label: "Low-carb" },
] as const;

export type DietaryPatternId = (typeof DIETARY_PATTERNS)[number]["id"];

export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Mostly sitting", description: "Office work, little intentional movement" },
  { id: "light", label: "Light", description: "Walks, some standing, 1–2 workouts a week" },
  { id: "moderate", label: "Moderate", description: "3–4 workouts a week, on your feet often" },
  { id: "active", label: "Active", description: "5+ workouts a week, physical job" },
  { id: "very-active", label: "Very active", description: "Daily training, athletic load" },
] as const;

export type ActivityLevelId = (typeof ACTIVITY_LEVELS)[number]["id"];

export const ALLERGENS = [
  { id: "peanuts", label: "Peanuts" },
  { id: "tree-nuts", label: "Tree nuts" },
  { id: "milk", label: "Milk / dairy" },
  { id: "eggs", label: "Eggs" },
  { id: "wheat", label: "Wheat / gluten" },
  { id: "soy", label: "Soy" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "sesame", label: "Sesame" },
] as const;

export type AllergenId = (typeof ALLERGENS)[number]["id"];
