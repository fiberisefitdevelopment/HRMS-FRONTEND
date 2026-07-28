"use client";

import { useQuery } from "@tanstack/react-query";
import { managersService } from "@/services/managers/managers.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { ManagerTeamParams } from "@/types/manager";

export function useManagerTeamQuery(params?: ManagerTeamParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission, hasRole } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.manager.team(params),
    queryFn: () => managersService.getTeam(params),
    enabled: isAuthenticated && hasPermission("manager.read") && hasRole("manager"),
    placeholderData: (prev) => prev,
  });
}
