"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GOALS } from "@/lib/onboarding/options";
import { goalsSchema, type GoalsInput } from "@/lib/onboarding/schemas";
import type { OnboardingState } from "@/lib/onboarding/state";

import type { StepProps } from "./types";

export function GoalsStep({ initialData, onSubmit }: StepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalsInput>({
    resolver: zodResolver(goalsSchema),
    defaultValues: { goals: initialData.goals ?? [] },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data as Partial<OnboardingState>);
      })}
      className="space-y-5"
      noValidate
    >
      <Controller
        control={control}
        name="goals"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2.5">
            {GOALS.map((g) => {
              const checked = field.value?.includes(g.id) ?? false;
              return (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40 has-[:focus-visible]:border-primary/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(state) => {
                      const next =
                        state === true
                          ? [...(field.value ?? []), g.id]
                          : (field.value ?? []).filter((id) => id !== g.id);
                      field.onChange(next);
                    }}
                  />
                  <span className="text-sm font-medium">{g.label}</span>
                </label>
              );
            })}
          </div>
        )}
      />
      {errors.goals ? <p className="text-xs text-destructive">{errors.goals.message}</p> : null}

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
