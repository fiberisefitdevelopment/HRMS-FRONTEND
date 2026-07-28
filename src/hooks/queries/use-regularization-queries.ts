"use client";

import { useQuery } from "@tanstack/react-query";
import { regularizationService } from "@/services/regularization/regularization.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { RegularizationListParams } from "@/types/regularization";

export function useRegularizationEligibilityQuery(date?: string, enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();
  const dateKey = date?.slice(0, 10);

  return useQuery({
    queryKey: QUERY_KEYS.regularization.eligibility(dateKey),
    queryFn: () => regularizationService.getEligibility(dateKey),
    enabled: isAuthenticated && hasPermission("regularization.create") && enabled,
    retry: false,
  });
}

export function useRegularizationListQuery(params?: RegularizationListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.regularization.all(params),
    queryFn: () => regularizationService.list(params),
    enabled: isAuthenticated && hasPermission("regularization.read"),
    placeholderData: (prev) => prev,
  });
}

export function useRegularizationDetailQuery(id?: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.regularization.detail(id ?? ""),
    queryFn: () => regularizationService.getById(id!),
    enabled: isAuthenticated && Boolean(id) && hasPermission("regularization.read"),
  });
}
