"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoginMutation } from "@/hooks/mutations/use-auth-mutations";
import { ROUTES } from "@/config/routes";
import { getErrorMessage, getFieldErrors } from "@/services/api/error-handler";
import { ApiError } from "@/types/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or employee code is required")
    .refine(
      (value) => {
        const trimmed = value.trim();
        if (trimmed.includes("@")) {
          return z.string().email().safeParse(trimmed).success;
        }
        return /^[A-Za-z0-9_-]+$/.test(trimmed);
      },
      { message: "Enter a valid email or employee code (e.g. FR0001)" }
    ),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setFormError(null);
    try {
      const loginId = data.email.trim();
      await loginMutation.mutateAsync({
        email: loginId.includes("@") ? loginId.toLowerCase() : loginId.toUpperCase(),
        password: data.password,
        rememberMe: data.rememberMe,
      });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (field === "email" || field === "password") {
            setError(field, { message: messages[0] });
          }
        });
      }
      if (error instanceof ApiError && error.statusCode === 403) {
        setFormError(getErrorMessage(error));
      } else if (!fieldErrors) {
        setFormError(getErrorMessage(error));
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            H
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your HRMS account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email or employee code</Label>
            <Input
              id="email"
              type="text"
              placeholder="you@company.com or FR0001"
              autoComplete="username"
              disabled={loginMutation.isPending}
              error={errors.email?.message}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href={ROUTES.forgotPassword} className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                error={errors.password?.message}
                className="pr-10"
                {...register("password")}
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
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              disabled={loginMutation.isPending}
              checked={watch("rememberMe")}
              onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" isLoading={loginMutation.isPending} disabled={loginMutation.isPending}>
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
