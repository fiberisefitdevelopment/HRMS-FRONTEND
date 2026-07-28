"use client";

import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit/audit.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { AuditLogListParams } from "@/types/audit";

export function useAuditLogsQuery(params?: AuditLogListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.audit.all(params),
    queryFn: () => auditService.list(params),
    enabled: isAuthenticated && hasPermission("audit.read"),
    placeholderData: (prev) => prev,
  });
}
