"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CONDITION_CLUSTERS, CONDITIONS } from "@/lib/onboarding/options";
import { conditionsSchema, type ConditionsInput } from "@/lib/onboarding/schemas";
import type { OnboardingState } from "@/lib/onboarding/state";

import type { StepProps } from "./types";

export function ConditionsStep({ initialData, onSubmit }: StepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConditionsInput>({
    resolver: zodResolver(conditionsSchema),
    defaultValues: {
      conditions: initialData.conditions ?? [],
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data as Partial<OnboardingState>);
      })}
      className="space-y-6"
      noValidate
    >
      <Controller
        control={control}
        name="conditions"
        render={({ field }) => (
          <div className="space-y-5">
            {CONDITION_CLUSTERS.map((cluster) => (
              <div key={cluster.id} className="space-y-2.5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {cluster.label}
                </p>
                <div className="space-y-2">
                  {CONDITIONS.filter((c) => c.cluster === cluster.id).map((c) => {
                    const checked = field.value?.includes(c.id) ?? false;
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40 has-[:focus-visible]:border-primary/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(state) => {
                            const next =
                              state === true
                                ? [...(field.value ?? []), c.id]
                                : (field.value ?? []).filter((id) => id !== c.id);
                            field.onChange(next);
                          }}
                        />
                        <span className="text-sm font-medium">{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      />
      {errors.conditions ? (
        <p className="text-xs text-destructive">{errors.conditions.message}</p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
