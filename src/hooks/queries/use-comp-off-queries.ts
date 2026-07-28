"use client";

import { useQuery } from "@tanstack/react-query";
import { compOffService } from "@/services/comp-off/comp-off.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { CompOffListParams } from "@/types/comp-off";

export function useCompOffEligibilityQuery(date?: string, enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();
  const dateKey = date?.slice(0, 10);

  return useQuery({
    queryKey: QUERY_KEYS.compOff.eligibility(dateKey),
    queryFn: () => compOffService.getEligibility(dateKey),
    enabled: isAuthenticated && hasPermission("comp_off.create") && enabled,
    retry: false,
  });
}

export function useCompOffListQuery(params?: CompOffListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.compOff.all(params),
    queryFn: () => compOffService.list(params),
    enabled: isAuthenticated && hasPermission("comp_off.read"),
    placeholderData: (prev) => prev,
  });
}

export function useCompOffDetailQuery(id?: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.compOff.detail(id ?? ""),
    queryFn: () => compOffService.getById(id!),
    enabled: isAuthenticated && Boolean(id) && hasPermission("comp_off.read"),
  });
}
