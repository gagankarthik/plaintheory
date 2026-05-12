"use client";

import { useState } from "react";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTIVITY_LEVELS, type ActivityLevelId } from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

import type { StepProps } from "./types";

export function BodyStep({ initialData, onSubmit }: StepProps) {
  const [heightCm, setHeightCm] = useState<string>(
    initialData.body?.heightCm?.toString() ?? "",
  );
  const [weightKg, setWeightKg] = useState<string>(
    initialData.body?.weightKg?.toString() ?? "",
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevelId | "">(
    initialData.body?.activityLevel ?? "",
  );
  const [submitting, setSubmitting] = useState(false);

  const submit = async (skip = false) => {
    setSubmitting(true);
    const patch: Partial<OnboardingState> = {};
    if (!skip) {
      const body: NonNullable<OnboardingState["body"]> = {};
      const h = Number(heightCm);
      const w = Number(weightKg);
      if (h && h >= 80 && h <= 260) body.heightCm = h;
      if (w && w >= 20 && w <= 300) body.weightKg = w;
      if (activityLevel) body.activityLevel = activityLevel;
      if (Object.keys(body).length > 0) patch.body = body;
    }
    await onSubmit(patch);
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(false);
      }}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Height (cm)" htmlFor="height">
          <Input
            id="height"
            type="number"
            inputMode="numeric"
            min={80}
            max={260}
            placeholder="170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </FormField>
        <FormField label="Weight (kg)" htmlFor="weight">
          <Input
            id="weight"
            type="number"
            inputMode="numeric"
            min={20}
            max={300}
            placeholder="70"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Activity level" htmlFor="activity">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {ACTIVITY_LEVELS.map((a) => {
            const active = activityLevel === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setActivityLevel(a.id)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:bg-accent/40",
                )}
              >
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </button>
            );
          })}
        </div>
      </FormField>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          size="lg"
          onClick={() => void submit(true)}
          disabled={submitting}
        >
          Skip
        </Button>
        <Button type="submit" className="flex-1" size="lg" loading={submitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}
