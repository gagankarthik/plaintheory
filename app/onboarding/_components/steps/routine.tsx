"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routineSchema, type RoutineInput } from "@/lib/onboarding/schemas";

import type { StepProps } from "./types";

export function RoutineStep({ initialData, onSubmit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoutineInput>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      wakeTime: initialData.wakeTime ?? "07:00",
      sleepTime: initialData.sleepTime ?? "23:00",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="space-y-5"
      noValidate
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Wake" htmlFor="wakeTime" error={errors.wakeTime?.message}>
          <Input
            id="wakeTime"
            type="time"
            aria-invalid={errors.wakeTime ? true : undefined}
            {...register("wakeTime")}
          />
        </FormField>
        <FormField label="Sleep" htmlFor="sleepTime" error={errors.sleepTime?.message}>
          <Input
            id="sleepTime"
            type="time"
            aria-invalid={errors.sleepTime ? true : undefined}
            {...register("sleepTime")}
          />
        </FormField>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
