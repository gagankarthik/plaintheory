import type { Condition } from "./types";

export const CONDITION_REGISTRY: Record<string, Condition> = {
  mornings: {
    slug: "mornings",
    name: "Mindful mornings",
    cluster: "rhythm",
    description:
      "How the day starts shapes the rest of it. Anchoring the first hour with light, movement, and intention pays off across mood, focus, and energy.",
    lifestyleInterventions: [
      "Get bright light within an hour of waking — it sets the body clock.",
      "Move for 5–15 minutes before sitting at a screen.",
      "Eat breakfast with protein and complex carbs to stabilize energy.",
      "Pick one priority before opening email or messages.",
    ],
    commonSymptomPatterns: [
      "Snoozing repeatedly and starting late",
      "Reaching for the phone in bed",
      "Skipping breakfast and crashing at 11am",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Same wake time most days, including weekends",
      "Sunlight within 30 minutes of waking",
      "Two-minute movement (stretch, walk, push-ups)",
      "Write tomorrow's #1 priority before bed",
    ],
    generallyHelpful: {
      foods: ["Eggs", "Greek yogurt", "Oats", "Berries", "Avocado toast with protein"],
      activities: ["Morning walk", "Stretching", "Journaling", "Cold water on face"],
    },
    generallyHarmful: {
      foods: ["Sugary cereals", "Pastries on empty stomach"],
      activities: ["Phone in bed", "Hitting snooze repeatedly", "Caffeine before water"],
    },
    sources: [],
  },
  focus: {
    slug: "focus",
    name: "Steady energy & focus",
    cluster: "rhythm",
    description:
      "Energy and focus aren't willpower — they're outputs of sleep, food, movement, and how you structure attention.",
    lifestyleInterventions: [
      "Protein at every meal stabilizes blood sugar and concentration.",
      "Work in 25–50 minute focused blocks with short breaks.",
      "Avoid back-to-back meetings for deep-work days.",
      "Reduce decision load — same breakfast, set work uniform.",
    ],
    commonSymptomPatterns: [
      "Mid-morning crash after a carb-heavy breakfast",
      "Afternoon slump after lunch",
      "Trouble starting tasks even when motivated",
      "Hyperfocus on easy work while important work waits",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Protein breakfast within 90 minutes of waking",
      "One pomodoro for the most important task before email",
      "10-minute walk after lunch",
      "Phone in another room during deep work",
    ],
    generallyHelpful: {
      foods: ["Eggs", "Lean protein", "Nuts and seeds", "Leafy greens", "Whole grains"],
      activities: ["Pomodoro sprints", "Time-boxing", "Body doubling", "Daily movement"],
    },
    generallyHarmful: {
      foods: ["Sugar-spike breakfasts", "Caffeine after 2pm", "Heavy lunches"],
      activities: ["Multitasking on important work", "Open notifications", "Working in bed"],
    },
    sources: [],
  },
  sleep: {
    slug: "sleep",
    name: "Restful sleep",
    cluster: "rhythm",
    description:
      "Sleep is the foundation that everything else stands on. A consistent schedule and a calm last hour matter more than any single hack.",
    lifestyleInterventions: [
      "Wake at the same time every day, even weekends.",
      "Bright light early; dim light an hour before bed.",
      "Caffeine cutoff in the early afternoon.",
      "Keep the bedroom cool, dark, and screen-free.",
    ],
    commonSymptomPatterns: [
      "Trouble falling asleep with mind racing",
      "Waking at 3am unable to return to sleep",
      "Unrefreshing sleep despite 7+ hours",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Consistent wake time",
      "No screens in bed",
      "Wind-down routine 30–60 minutes before sleep",
      "Cool room (65–68°F / 18–20°C)",
    ],
    generallyHelpful: {
      foods: [
        "Light dinner finished 3 hours before bed",
        "Kiwi",
        "Tart cherry juice",
        "Chamomile tea",
      ],
      activities: ["Reading paperbacks", "Stretching", "Warm shower", "Journaling"],
    },
    generallyHarmful: {
      foods: ["Late caffeine", "Alcohol close to bed", "Heavy late dinners"],
      activities: ["Phone in bed", "Bright overhead light at night", "Doomscrolling"],
    },
    sources: [],
  },
  movement: {
    slug: "movement",
    name: "Move more",
    cluster: "body",
    description:
      "Daily movement is the single most reliable lever for mood, energy, sleep, and longevity. It doesn't have to be a gym.",
    lifestyleInterventions: [
      "Build a daily walking habit — 20–30 minutes is plenty.",
      "Add 2–3 strength sessions a week.",
      "Take movement breaks every 30–60 minutes if desk-bound.",
      "Find an activity you enjoy enough to do consistently.",
    ],
    commonSymptomPatterns: [
      "Stiff back and shoulders by mid-afternoon",
      "Energy dropping the more you sit",
      "All-or-nothing exercise patterns",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "20-minute walk most days",
      "Stand or stretch every hour",
      "Two strength sessions per week",
      "Stairs over elevators when reasonable",
    ],
    generallyHelpful: {
      foods: ["Protein within 90 minutes after a workout", "Hydration", "Whole grains for fuel"],
      activities: ["Walking", "Strength training", "Yoga", "Cycling", "Dancing"],
    },
    generallyHarmful: {
      foods: [],
      activities: ["Prolonged sitting", "All-or-nothing training", "No rest days"],
    },
    sources: [],
  },
  nutrition: {
    slug: "nutrition",
    name: "Mindful eating",
    cluster: "body",
    description:
      "Eating well isn't a diet — it's a thousand small choices. The goal is variety, enough protein and fiber, and being present at the table.",
    lifestyleInterventions: [
      "Protein and fiber at every meal stabilize energy.",
      "Eat slowly and notice when you're satisfied (not stuffed).",
      "Cook at home when you can — it gives you control.",
      "Stay hydrated — thirst often masquerades as hunger.",
    ],
    commonSymptomPatterns: [
      "Eating mindlessly while distracted",
      "Skipping meals then over-eating later",
      "Strong cravings tied to stress, not hunger",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Protein at breakfast",
      "Two cups of vegetables at lunch and dinner",
      "Water alongside each meal",
      "No screens at the table when possible",
    ],
    generallyHelpful: {
      foods: [
        "Vegetables and fruit (variety of colors)",
        "Lean protein (fish, poultry, legumes, tofu)",
        "Whole grains (oats, brown rice, quinoa)",
        "Nuts, seeds, olive oil",
        "Fermented foods (yogurt, kimchi)",
      ],
      activities: ["Cooking at home", "Eating slowly", "Hydrating before meals", "Meal planning"],
    },
    generallyHarmful: {
      foods: ["Sugary drinks", "Ultra-processed snacks", "Heavily fried foods"],
      activities: [
        "Eating while driving",
        "Eating at the desk every day",
        "Restrictive crash diets",
      ],
    },
    sources: [],
  },
  mood: {
    slug: "mood",
    name: "Mood awareness",
    cluster: "body",
    description:
      "Noticing how you feel — and what preceded it — is half of getting better at life. PlainTheory tracks gently, never clinically.",
    lifestyleInterventions: [
      "Log feelings briefly (one word + 1–5 rating) instead of long entries.",
      "Move daily; movement is the most reliable mood lever.",
      "Connect with someone in person at least weekly.",
      "Limit doomscrolling windows.",
    ],
    commonSymptomPatterns: [
      "Low mood tied to sleep loss or skipped meals",
      "Stress accumulating without an outlet",
      "Isolation creeping in during busy weeks",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Morning + evening mood check-in (10 seconds each)",
      "One conversation with someone you like",
      "20-minute movement",
      "Phone away for the last hour of the day",
    ],
    generallyHelpful: {
      foods: ["Omega-3 rich foods", "Whole grains for steady energy", "Adequate hydration"],
      activities: ["Daily movement", "Sunlight", "Time with friends", "Journaling", "Breathwork"],
    },
    generallyHarmful: {
      foods: ["Excess alcohol", "Caffeine after early afternoon"],
      activities: ["Isolation", "Doomscrolling", "Sleep deprivation"],
    },
    sources: [],
  },
  stress: {
    slug: "stress",
    name: "Less stress",
    cluster: "mind",
    description:
      "Stress isn't the enemy — chronic, unaddressed stress is. Build recovery into the day, not just into the weekend.",
    lifestyleInterventions: [
      "Practice slow breathing daily — even 2 minutes shifts the nervous system.",
      "Get outside, even briefly, every day.",
      "Maintain consistent sleep — it's the biggest stress modulator.",
      "Name one thing you're grateful for daily.",
    ],
    commonSymptomPatterns: [
      "Shoulders or jaw tense by mid-day",
      "Mind racing at bedtime",
      "Snappiness with the people you love",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "Five minutes of slow breathing",
      "10 minutes outside",
      "Brief shutdown routine to mark end of work",
      "One screen-free meal per day",
    ],
    generallyHelpful: {
      foods: ["Magnesium-rich foods (leafy greens, nuts, seeds)", "Steady-energy meals"],
      activities: ["Breathwork", "Walking", "Yoga", "Time outdoors", "Connection"],
    },
    generallyHarmful: {
      foods: ["Excess caffeine", "Excess alcohol"],
      activities: ["Skipping breaks", "Always-on notifications", "Working through meals"],
    },
    sources: [],
  },
  learning: {
    slug: "learning",
    name: "Continuous learning",
    cluster: "mind",
    description:
      "A small daily investment in learning compounds quickly. The trick is consistency over intensity.",
    lifestyleInterventions: [
      "Block 20–30 minutes most days for learning.",
      "Pick one thing at a time — depth beats breadth.",
      "Teach what you learn to anchor it.",
      "Read on paper; you'll remember more.",
    ],
    commonSymptomPatterns: [
      "Collecting courses without finishing",
      "Consuming content without applying it",
      "Mid-evening 'I should be learning' guilt",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "20 minutes of focused learning",
      "Take notes in your own words",
      "Re-read or summarize at end of week",
      "Apply one thing within 48 hours",
    ],
    generallyHelpful: {
      foods: [],
      activities: [
        "Reading",
        "Active recall",
        "Spaced repetition",
        "Teaching others",
        "Long walks for thinking",
      ],
    },
    generallyHarmful: {
      foods: [],
      activities: ["Passive consumption only", "Tab hoarding", "Switching topics weekly"],
    },
    sources: [],
  },
  relationships: {
    slug: "relationships",
    name: "Stronger relationships",
    cluster: "mind",
    description:
      "The strongest predictor of well-being across decades is the quality of close relationships. Tend them like a garden.",
    lifestyleInterventions: [
      "Schedule recurring time with the few people who matter.",
      "Send small check-ins — one text, no agenda.",
      "Be the one to reach out first sometimes.",
      "Be fully present in conversations — phone away.",
    ],
    commonSymptomPatterns: [
      "Weeks slipping by without reaching out",
      "Phone present in important conversations",
      "Saying yes when you mean no, then resenting it",
    ],
    redFlagSymptoms: [],
    recommendedDailyHabits: [
      "One small connection daily (call, text, in-person)",
      "Weekly long conversation with someone close",
      "Phone face-down in social moments",
      "Active listening — ask one more question",
    ],
    generallyHelpful: {
      foods: [],
      activities: ["Regular meals with others", "Phone-free conversations", "Long walks together"],
    },
    generallyHarmful: {
      foods: [],
      activities: [
        "Always being too busy",
        "Letting messages pile up",
        "Avoiding hard conversations",
      ],
    },
    sources: [],
  },
};

export function getCondition(slug: string) {
  return CONDITION_REGISTRY[slug] ?? null;
}

export function getConditions(slugs: string[]) {
  return slugs
    .map((slug) => getCondition(slug))
    .filter((c): c is NonNullable<ReturnType<typeof getCondition>> => c !== null);
}

export type { Condition } from "./types";
