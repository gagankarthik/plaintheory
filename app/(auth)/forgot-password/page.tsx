"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth/cognito-client";
import { cognitoErrorMessage } from "@/lib/auth/errors";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/validation";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: prefilledEmail },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setFormError(null);
    try {
      await resetPassword(data.email);
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setFormError(cognitoErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.1)]">
        <CardHeader className="space-y-2 px-8 pb-2 pt-10 text-center">
          <CardTitle className="font-serif text-3xl tracking-tight">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&rsquo;ll send a code to set a new password.
          </CardDescription>
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

            {formError ? (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Send code
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
