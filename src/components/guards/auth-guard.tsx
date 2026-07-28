"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES, ROLE_ROUTES } from "@/config/routes";
import { PageLoader } from "@/components/feedback/loading-spinner";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading) return <PageLoader />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      const roleRoute = ROLE_ROUTES[user.role] ?? ROUTES.employee;
      router.replace(roleRoute);
    }
  }, [isAuthenticated, isInitialized, isLoading, user, router]);

  if (!isInitialized || isLoading) return <PageLoader />;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
