export type ClusterId = "rhythm" | "body" | "mind";

export type Source = {
  label: string;
  url: string;
};

export type Condition = {
  slug: string;
  name: string;
  cluster: ClusterId;
  description: string;
  lifestyleInterventions: string[];
  commonSymptomPatterns: string[];
  redFlagSymptoms: string[];
  recommendedDailyHabits: string[];
  generallyHelpful: {
    foods: string[];
    activities: string[];
  };
  generallyHarmful: {
    foods: string[];
    activities: string[];
  };
  sources: Source[];
};
