"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  STEP_META,
  STEP_ORDER,
  type OnboardingState,
  type StepId,
  nextStep,
  prevStep,
} from "@/lib/onboarding/state";

import { Progress } from "./progress";
import { AboutYouStep } from "./steps/about-you";
import { BodyStep } from "./steps/body";
import { ConditionsStep } from "./steps/conditions";
import { DisclaimerStep } from "./steps/disclaimer";
import { GoalsStep } from "./steps/goals";
import { MedicationsStep } from "./steps/medications";
import { NotificationsStep } from "./steps/notifications";
import { RoutineStep } from "./steps/routine";

type Props = {
  initial: OnboardingState;
};

export function Wizard({ initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initial);
  const currentStep: StepId = state.step === "complete" ? "disclaimer" : (state.step as StepId);
  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const persist = async (patch: Partial<OnboardingState>): Promise<boolean> => {
    const res = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error("Couldn't save — try again in a moment.");
      return false;
    }
    return true;
  };

  const handleStepSubmit = async (patch: Partial<OnboardingState>) => {
    const next = nextStep(currentStep);

    if (next === "complete") {
      const saved = await persist(patch);
      if (!saved) return;
      const finalRes = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!finalRes.ok) {
        toast.error("Couldn't finish onboarding — try again.");
        return;
      }
      router.push("/app");
      router.refresh();
      return;
    }

    const saved = await persist({ ...patch, step: next });
    if (!saved) return;
    setState((s) => ({ ...s, ...patch, step: next }));
  };

  const handleBack = () => {
    const prev = prevStep(currentStep);
    if (!prev) return;
    setState((s) => ({ ...s, step: prev }));
  };

  const meta = STEP_META[currentStep];

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-6 py-12">
      <Progress current={stepIndex} total={STEP_ORDER.length} />
      <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.1)]">
        <CardContent className="space-y-6 px-8 py-10">
          <header className="space-y-2 text-center">
            <h1 className="font-serif text-3xl tracking-tight">{meta.title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
          </header>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <StepRenderer step={currentStep} state={state} onSubmit={handleStepSubmit} />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
      {stepIndex > 0 ? (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            ← Back
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StepRenderer({
  step,
  state,
  onSubmit,
}: {
  step: StepId;
  state: OnboardingState;
  onSubmit: (patch: Partial<OnboardingState>) => Promise<void>;
}) {
  switch (step) {
    case "about-you":
      return <AboutYouStep initialData={state} onSubmit={onSubmit} />;
    case "body":
      return <BodyStep initialData={state} onSubmit={onSubmit} />;
    case "conditions":
      return <ConditionsStep initialData={state} onSubmit={onSubmit} />;
    case "medications":
      return <MedicationsStep initialData={state} onSubmit={onSubmit} />;
    case "routine":
      return <RoutineStep initialData={state} onSubmit={onSubmit} />;
    case "goals":
      return <GoalsStep initialData={state} onSubmit={onSubmit} />;
    case "notifications":
      return <NotificationsStep initialData={state} onSubmit={onSubmit} />;
    case "disclaimer":
      return <DisclaimerStep initialData={state} onSubmit={onSubmit} />;
  }
}
