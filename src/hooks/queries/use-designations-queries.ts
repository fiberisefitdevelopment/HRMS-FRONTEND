"use client";

import { useQuery } from "@tanstack/react-query";
import { designationsService } from "@/services/designations/designations.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { DesignationListParams } from "@/types/designation";

export function useDesignationsQuery(params?: DesignationListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.designation.all(params),
    queryFn: () => designationsService.list(params),
    enabled: isAuthenticated && hasPermission("designation.read"),
  });
}

export function useDesignationQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.designation.detail(id ?? ""),
    queryFn: () => designationsService.getById(id!),
    enabled: isAuthenticated && hasPermission("designation.read") && !!id,
  });
}

export function useDesignationsLookupQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.designation.lookup,
    queryFn: () => designationsService.list({ limit: 100, isActive: true }),
    enabled: isAuthenticated && hasPermission("designation.read"),
    staleTime: 5 * 60 * 1000,
  });
}
