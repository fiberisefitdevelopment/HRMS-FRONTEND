"use client";

import { useQuery } from "@tanstack/react-query";
import { wfhService } from "@/services/wfh/wfh.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { WfhListParams } from "@/types/wfh";

export function useWfhListQuery(params?: WfhListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.wfh.all(params),
    queryFn: () => wfhService.list(params),
    enabled: isAuthenticated && hasPermission("wfh.read"),
    placeholderData: (prev) => prev,
  });
}

export function useWfhDetailQuery(id?: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.wfh.detail(id ?? ""),
    queryFn: () => wfhService.getById(id!),
    enabled: isAuthenticated && Boolean(id) && hasPermission("wfh.read"),
  });
}
