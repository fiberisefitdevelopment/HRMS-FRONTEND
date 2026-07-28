"use client";

import { useQuery } from "@tanstack/react-query";
import { permissionsService } from "@/services/permissions/permissions.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";

export function usePermissionsQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.permissions.all,
    queryFn: () => permissionsService.getPermissions(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
