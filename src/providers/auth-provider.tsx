"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import { useSessionQuery } from "@/hooks/queries/use-auth-queries";
import { hasStoredSession, clearTokens } from "@/lib/auth/token-storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const setProfile = useUserStore((s) => s.setProfile);

  const hasSession = hasStoredSession();
  const { data, isLoading, isError, isFetched } = useSessionQuery(hasSession);

  useEffect(() => {
    if (!hasSession) {
      clearSession();
      setInitialized(true);
      return;
    }

    setLoading(isLoading);

    if (data) {
      setSession({
        user: data.user,
        permissions: data.permissions,
      });
      setProfile(data.user);
    }

    if (isError) {
      clearTokens();
      clearSession();
    }

    if (isFetched) {
      setInitialized(true);
      setLoading(false);
    }
  }, [
    hasSession,
    data,
    isLoading,
    isError,
    isFetched,
    setSession,
    clearSession,
    setLoading,
    setInitialized,
    setProfile,
  ]);

  return <>{children}</>;
}
