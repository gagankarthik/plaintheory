"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { medicationsSchema, type MedicationsInput } from "@/lib/onboarding/schemas";

import type { StepProps } from "./types";

export function MedicationsStep({ initialData, onSubmit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicationsInput>({
    resolver: zodResolver(medicationsSchema),
    defaultValues: { medications: initialData.medications ?? "" },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="space-y-5"
      noValidate
    >
      <FormField
        label="Dietary notes"
        htmlFor="medications"
        error={errors.medications?.message}
        hint="Optional"
      >
        <Textarea
          id="medications"
          placeholder="Allergies, foods you avoid, dietary patterns (vegan, gluten-free), or anything else worth knowing."
          rows={6}
          aria-invalid={errors.medications ? true : undefined}
          {...register("medications")}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          size="lg"
          onClick={async () => {
            await onSubmit({ medications: "" });
          }}
        >
          Skip
        </Button>
        <Button type="submit" className="flex-1" size="lg" loading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}
