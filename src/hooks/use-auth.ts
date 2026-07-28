"use client";

import { useAuthStore } from "@/store/auth-store";
import { useLoginMutation, useLogoutMutation } from "@/hooks/mutations/use-auth-mutations";

export function useAuth() {
  const { user, permissions, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  return {
    user,
    permissions,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    isInitialized,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
