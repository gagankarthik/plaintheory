import type { OnboardingState } from "@/lib/onboarding/state";

export type StepProps = {
  initialData: OnboardingState;
  onSubmit: (patch: Partial<OnboardingState>) => Promise<void> | void;
};
