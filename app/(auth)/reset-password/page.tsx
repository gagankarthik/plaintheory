"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { confirmResetPassword, resetPassword } from "@/lib/auth/cognito-client";
import { cognitoErrorMessage } from "@/lib/auth/errors";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/validation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    if (!email) {
      setFormError("We don't know which account to reset. Start over below.");
      return;
    }
    try {
      await confirmResetPassword(email, data.code, data.password);
      toast.success("Password updated. Sign in with your new password.");
      router.push(`/sign-in?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setFormError(cognitoErrorMessage(err));
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resetPassword(email);
      toast.success("New code sent. Check your inbox.");
    } catch (err) {
      toast.error(cognitoErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_24px_48px_-24px_rgb(0_0_0_/_0.1)]">
        <CardHeader className="space-y-2 px-8 pb-2 pt-10 text-center">
          <CardTitle className="font-serif text-3xl tracking-tight">Set a new password</CardTitle>
          <CardDescription>
            {email ? (
              <>
                We sent a six-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              "Enter the code we sent to your email."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField label="Verification code" htmlFor="code" error={errors.code?.message}>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="text-center text-lg tracking-[0.4em]"
                aria-invalid={errors.code ? true : undefined}
                {...register("code")}
              />
            </FormField>

            <FormField
              label="New password"
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

            {formError ? (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Update password
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Didn&rsquo;t get a code?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={resending || !email}
              className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend"}
            </button>
          </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
