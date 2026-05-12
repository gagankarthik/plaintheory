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
import { signIn, syncServerSession } from "@/lib/auth/cognito-client";
import { cognitoErrorMessage, getCognitoErrorName } from "@/lib/auth/errors";
import { signInSchema, type SignInInput } from "@/lib/auth/validation";
import { safeReturnTo } from "@/lib/safe-redirect";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const showExistsHint = searchParams.get("exists") === "1";
  const from = searchParams.get("from");

  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: prefilledEmail, password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    setFormError(null);
    try {
      const result = await signIn(data.email, data.password);
      if (!result.isSignedIn) {
        const step = result.nextStep?.signInStep;
        if (step === "CONFIRM_SIGN_UP") {
          router.push(`/confirm?email=${encodeURIComponent(data.email)}`);
          return;
        }
        if (step === "RESET_PASSWORD") {
          router.push(`/forgot-password?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setFormError("Additional verification required. Please check your email.");
        return;
      }
      await syncServerSession();
      router.push(safeReturnTo(from));
      router.refresh();
    } catch (err) {
      const name = getCognitoErrorName(err);
      if (name === "UserNotConfirmedException") {
        router.push(`/confirm?email=${encodeURIComponent(data.email)}`);
        return;
      }
      if (name === "PasswordResetRequiredException") {
        router.push(`/forgot-password?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setFormError(cognitoErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.1)]">
        <CardHeader className="space-y-2 px-8 pb-2 pt-10 text-center">
          <CardTitle className="font-serif text-3xl tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to continue your plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 py-8">
          {showExistsHint ? (
            <div className="rounded-xl bg-info/10 px-4 py-3 text-sm text-info">
              You already have an account. Sign in below.
            </div>
          ) : null}

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
              hint={
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Forgot?
                </Link>
              }
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
              />
            </FormField>

            {formError ? (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
