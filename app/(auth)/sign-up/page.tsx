"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/cognito-client";
import { cognitoErrorMessage, getCognitoErrorName } from "@/lib/auth/errors";
import { signUpSchema, type SignUpInput } from "@/lib/auth/validation";

export default function SignUpPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", termsAccepted: false },
  });

  const onSubmit = async (data: SignUpInput) => {
    setFormError(null);
    try {
      await signUp(data.email, data.password);
      router.push(`/confirm?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      if (getCognitoErrorName(err) === "UsernameExistsException") {
        router.push(`/sign-in?email=${encodeURIComponent(data.email)}&exists=1`);
        return;
      }
      setFormError(cognitoErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.1)]">
        <CardHeader className="space-y-2 px-8 pb-2 pt-10 text-center">
          <CardTitle className="font-serif text-3xl tracking-tight">Create your account</CardTitle>
          <CardDescription>A calm companion for daily life.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              hint="12+ chars · mixed case · number · symbol"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••••"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
              />
            </FormField>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="termsAccepted"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      className="mt-0.5"
                    />
                  )}
                />
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm font-normal leading-relaxed text-muted-foreground"
                >
                  I understand PlainTheory is general coaching — not therapy, counseling, or medical
                  care — and isn&rsquo;t a substitute for a professional.
                </Label>
              </div>
              {errors.termsAccepted ? (
                <p className="text-xs text-destructive">{errors.termsAccepted.message}</p>
              ) : null}
            </div>

            {formError ? (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
