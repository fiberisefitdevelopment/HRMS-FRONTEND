"use client";

import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies/companies.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { CompanyListParams } from "@/types/company";

export function useCompaniesQuery(params?: CompanyListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.company.all(params),
    queryFn: () => companiesService.list(params),
    enabled: isAuthenticated && hasPermission("company.read"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanyQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.company.detail(id ?? ""),
    queryFn: () => companiesService.getById(id!),
    enabled: isAuthenticated && hasPermission("company.read") && !!id,
  });
}
