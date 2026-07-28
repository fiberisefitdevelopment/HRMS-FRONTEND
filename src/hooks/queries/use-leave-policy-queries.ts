"use client";

import { useQuery } from "@tanstack/react-query";
import { leavePolicyService } from "@/services/leave-policies/leave-policy.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";

export function useLeavePolicyQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasAnyPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leavePolicy.current,
    queryFn: () => leavePolicyService.get(),
    enabled:
      isAuthenticated &&
      hasAnyPermission(["leave.policy.read", "leave.create"]),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const message = String(error).toLowerCase();
      if (message.includes("403") || message.includes("forbidden")) return false;
      return failureCount < 2;
    },
  });
}
