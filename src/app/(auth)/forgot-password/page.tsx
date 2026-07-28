"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services/auth/auth.service";
import { getErrorMessage } from "@/services/api/error-handler";

const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters with uppercase, lowercase, number, and special character";

const passwordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS)
  .regex(/[A-Z]/, PASSWORD_REQUIREMENTS)
  .regex(/[a-z]/, PASSWORD_REQUIREMENTS)
  .regex(/\d/, PASSWORD_REQUIREMENTS)
  .regex(/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/, PASSWORD_REQUIREMENTS);

const emailStepSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetStepSchema = z
  .object({
    otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be 4–8 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailStepForm = z.infer<typeof emailStepSchema>;
type ResetStepForm = z.infer<typeof resetStepSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailStepForm>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetStepForm>({
    resolver: zodResolver(resetStepSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const onRequestOtp = async (data: EmailStepForm) => {
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const result = await authService.forgotPassword({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setStep("reset");
      setSuccessMessage(
        result.message ||
          "If an account exists with this email, a password reset OTP has been sent."
      );
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetPassword = async (data: ResetStepForm) => {
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setSuccessMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.replace(ROUTES.login), 2000);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword({ email });
      setSuccessMessage(result.message || "A new OTP has been sent to your email.");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {step === "email" ? "Forgot password?" : "Reset password"}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email and we'll send you a one-time password (OTP)"
            : `Enter the OTP sent to ${email} and choose a new password`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              Send OTP
            </Button>
            <div className="text-center">
              <Link href={ROUTES.login} className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoComplete="one-time-code"
                disabled={isSubmitting}
                {...resetForm.register("otp")}
              />
              {resetForm.formState.errors.otp && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="pr-10"
                  {...resetForm.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {resetForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="pr-10"
                  {...resetForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              Reset password
            </Button>

            <div className="flex flex-col items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                disabled={isSubmitting}
                className="text-muted-foreground hover:underline disabled:opacity-50"
              >
                Use a different email
              </button>
              <Link href={ROUTES.login} className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
