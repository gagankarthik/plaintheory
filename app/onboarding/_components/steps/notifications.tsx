"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { notificationsSchema, type NotificationsInput } from "@/lib/onboarding/schemas";

import type { StepProps } from "./types";

const ITEMS: Array<{
  name: keyof NotificationsInput;
  label: string;
  description: string;
}> = [
  {
    name: "dailyPlan",
    label: "Morning plan",
    description: "Three focus actions for the day, sent at your wake time.",
  },
  {
    name: "eveningReflection",
    label: "Evening reflection",
    description: "A short three-question check-in at bedtime.",
  },
  {
    name: "weeklyInsights",
    label: "Weekly insights",
    description: "Sunday recap of patterns we noticed across the week.",
  },
];

export function NotificationsStep({ initialData, onSubmit }: StepProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NotificationsInput>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      dailyPlan: initialData.notifications?.dailyPlan ?? true,
      eveningReflection: initialData.notifications?.eveningReflection ?? false,
      weeklyInsights: initialData.notifications?.weeklyInsights ?? true,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({ notifications: data });
      })}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2.5">
        {ITEMS.map((item) => (
          <Controller
            key={item.name}
            control={control}
            name={item.name}
            render={({ field }) => (
              <label
                htmlFor={item.name}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40 has-[:focus-visible]:border-primary/40"
              >
                <Checkbox
                  id={item.name}
                  checked={field.value}
                  onCheckedChange={(state) => field.onChange(state === true)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </label>
            )}
          />
        ))}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
