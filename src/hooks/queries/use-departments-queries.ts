"use client";

import { useQuery } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments/departments.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { DepartmentListParams } from "@/types/department";

export function useDepartmentsQuery(params?: DepartmentListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.department.all(params),
    queryFn: () => departmentsService.list(params),
    enabled: isAuthenticated && hasPermission("department.read"),
  });
}

export function useDepartmentQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.department.detail(id ?? ""),
    queryFn: () => departmentsService.getById(id!),
    enabled: isAuthenticated && hasPermission("department.read") && !!id,
  });
}

export function useDepartmentsLookupQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.department.lookup,
    queryFn: () => departmentsService.list({ limit: 100, isActive: true }),
    enabled: isAuthenticated && hasPermission("department.read"),
    staleTime: 5 * 60 * 1000,
  });
}
