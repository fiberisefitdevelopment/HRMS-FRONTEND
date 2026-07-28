"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { mapApiUser } from "@/lib/auth/auth-mapper";
import { setTokens, clearTokens } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/store/auth-store";
import { useCompanyStore } from "@/store/company-store";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ROLE_ROUTES, ROUTES } from "@/config/routes";
import type { ChangePasswordPayload, LoginCredentials } from "@/types/auth";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const setRememberMe = useAuthStore((s) => s.setRememberMe);
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const loginResult = await authService.login(credentials);
      setTokens(loginResult.tokens, credentials.rememberMe ?? true);
      setRememberMe(credentials.rememberMe ?? true);

      const me = await authService.getMe();
      return {
        user: mapApiUser(me.user, me.permissions),
        permissions: me.permissions,
        tokens: loginResult.tokens,
      };
    },
    onSuccess: (data) => {
      setSession({
        user: data.user,
        permissions: data.permissions,
        tokens: data.tokens,
      });
      queryClient.setQueryData(QUERY_KEYS.auth.me, {
        user: data.user,
        permissions: data.permissions,
      });
      const route = ROLE_ROUTES[data.user.role] ?? ROUTES.employee;
      router.replace(route);
      toast.success("Welcome back!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const clearCompanies = useCompanyStore((s) => s.clear);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearTokens();
      clearSession();
      clearCompanies();
      queryClient.clear();
      router.replace(ROUTES.login);
      toast.success("Logged out successfully");
    },
    onError: () => {
      clearTokens();
      clearSession();
      clearCompanies();
      queryClient.clear();
      router.replace(ROUTES.login);
    },
  });
}

export function useSwitchCompanyMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const rememberMe = useAuthStore((s) => s.rememberMe);

  type SwitchCompanyInput = {
    companyId: string;
    candidateCompanyIds?: string[];
    companyName?: string;
  };

  return useMutation({
    mutationFn: async ({ companyId, candidateCompanyIds }: SwitchCompanyInput) => {
      const attempts = [companyId, ...(candidateCompanyIds ?? [])].filter(Boolean);
      const uniqueAttempts = Array.from(new Set(attempts));
      if (uniqueAttempts.length === 0) throw new Error("Missing company ID");

      let lastError: unknown;
      let result: Awaited<ReturnType<typeof authService.switchCompany>> | null = null;

      for (const id of uniqueAttempts) {
        try {
          result = await authService.switchCompany(id);
          break;
        } catch (error) {
          lastError = error;
          const message = getErrorMessage(error).toLowerCase();
          const shouldTryNext =
            message.includes("duplicate value for companyid") ||
            message.includes("validation failed");
          if (!shouldTryNext) throw error;
        }
      }

      if (!result) throw lastError ?? new Error("Unable to switch company");

      setTokens(result.tokens, rememberMe);
      const me = await authService.getMe();
      return {
        user: mapApiUser(me.user, me.permissions),
        permissions: me.permissions,
        tokens: result.tokens,
      };
    },
    onSuccess: (data) => {
      setSession({
        user: data.user,
        permissions: data.permissions,
        tokens: data.tokens,
      });
      queryClient.setQueryData(QUERY_KEYS.auth.me, {
        user: data.user,
        permissions: data.permissions,
      });
      queryClient.invalidateQueries();
      toast.success("Company switched successfully");
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      const normalized = message.toLowerCase();
      if (normalized.includes("duplicate value for companyid")) {
        toast.info("Switch failed: backend treated selected company as current");
        return;
      }
      if (normalized.includes("validation failed")) {
        toast.error("Switch failed: backend rejected company identifier");
        return;
      }
      toast.error(message);
    },
  });
}

export function useChangePasswordMutation() {
  const logout = useLogoutMutation();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed. Please sign in again.");
      logout.mutate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
