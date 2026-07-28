"use client";

import { useQuery } from "@tanstack/react-query";
import { rolesService } from "@/services/roles/roles.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";

export function useRolesQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.roles.all,
    queryFn: () => rolesService.getRoles(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
