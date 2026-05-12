"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REGIONS } from "@/lib/onboarding/options";
import { aboutYouSchema, type AboutYouInput } from "@/lib/onboarding/schemas";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

import type { StepProps } from "./types";

export function AboutYouStep({ initialData, onSubmit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AboutYouInput>({
    resolver: zodResolver(aboutYouSchema),
    defaultValues: {
      region: initialData.region,
      birthYear: initialData.birthYear,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data as Partial<OnboardingState>);
      })}
      className="space-y-5"
      noValidate
    >
      <FormField label="Region" htmlFor="region" error={errors.region?.message}>
        <select
          id="region"
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm font-medium text-foreground",
            "transition-colors duration-200",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-invalid={errors.region ? true : undefined}
          {...register("region")}
        >
          <option value="">Select region</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Year of birth"
        htmlFor="birthYear"
        error={errors.birthYear?.message}
        hint="18+ only"
      >
        <Input
          id="birthYear"
          type="number"
          inputMode="numeric"
          min={1900}
          max={new Date().getFullYear() - 18}
          placeholder="1990"
          aria-invalid={errors.birthYear ? true : undefined}
          {...register("birthYear", { valueAsNumber: true })}
        />
      </FormField>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
