"use client";

import { useQuery } from "@tanstack/react-query";
import { shiftsService } from "@/services/shifts/shifts.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { ShiftListParams } from "@/types/shift";

export function useShiftsQuery(params?: ShiftListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.shift.all(params),
    queryFn: () => shiftsService.list(params),
    enabled: isAuthenticated && hasPermission("attendance.shift.manage"),
    placeholderData: (prev) => prev,
  });
}

export function useShiftQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.shift.detail(id ?? ""),
    queryFn: () => shiftsService.getById(id!),
    enabled: isAuthenticated && hasPermission("attendance.shift.manage") && !!id,
  });
}

export function useShiftsLookupQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: [...QUERY_KEYS.shift.all({ status: "active" }), "lookup"],
    queryFn: () => shiftsService.list({ limit: 100, status: "active" }),
    enabled: isAuthenticated && hasPermission("attendance.view"),
    staleTime: 5 * 60 * 1000,
  });
}
