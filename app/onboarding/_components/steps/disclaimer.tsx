"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { disclaimerSchema, type DisclaimerInput } from "@/lib/onboarding/schemas";

import type { StepProps } from "./types";

export function DisclaimerStep({ onSubmit }: StepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DisclaimerInput>({
    resolver: zodResolver(disclaimerSchema),
    defaultValues: { accepted: false },
  });

  return (
    <form
      onSubmit={handleSubmit(async () => {
        await onSubmit({});
      })}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-xl bg-muted/60 p-5 text-sm leading-relaxed text-muted-foreground">
        PlainTheory is a daily-life coaching companion. It offers{" "}
        <span className="font-medium text-foreground">
          general guidance, not therapy, counseling, or medical advice
        </span>
        . It&rsquo;s not a substitute for talking to a qualified professional. If something is
        urgent or serious, please reach out to someone you trust.
      </div>

      <Controller
        control={control}
        name="accepted"
        render={({ field }) => (
          <label
            htmlFor="accepted"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
          >
            <Checkbox
              id="accepted"
              checked={field.value}
              onCheckedChange={(state) => field.onChange(state === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed">I understand and accept.</span>
          </label>
        )}
      />
      {errors.accepted ? (
        <p className="text-xs text-destructive">{errors.accepted.message}</p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Get started
      </Button>
    </form>
  );
}
