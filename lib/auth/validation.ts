import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^a-zA-Z0-9]/, "Include a symbol");

export const emailSchema = z.string().min(1, "Required").email("Enter a valid email address");

export const codeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: "Please accept the disclaimer to continue",
  }),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const confirmSchema = z.object({
  code: codeSchema,
});
export type ConfirmInput = z.infer<typeof confirmSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  code: codeSchema,
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
