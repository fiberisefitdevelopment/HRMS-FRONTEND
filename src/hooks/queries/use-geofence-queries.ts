"use client";

import { useQuery } from "@tanstack/react-query";
import { geofenceService } from "@/services/geofence/geofence.service";
import { attendancePolicyService } from "@/services/attendance/attendance-policy.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { ValidateGeofencePayload } from "@/types/geofence";

export function useGeofencesQuery(params?: { page?: number; limit?: number; isActive?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.geofence.all(params),
    queryFn: () => geofenceService.list(params),
    enabled: isAuthenticated && hasPermission("geofence.read"),
    placeholderData: (prev) => prev,
  });
}

export function useGeofenceQuery(id: string | null | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.geofence.detail(id ?? ""),
    queryFn: () => geofenceService.getById(id!),
    enabled: isAuthenticated && Boolean(id) && hasPermission("geofence.read"),
  });
}

export function useAttendancePolicyQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.policy,
    queryFn: () => attendancePolicyService.get(),
    enabled: isAuthenticated && hasPermission("attendance.policy.read"),
    staleTime: 60_000,
  });
}

export function useValidateGeofenceQuery(
  coords: ValidateGeofencePayload | null,
  options?: { enabled?: boolean }
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.geofence.validate(coords),
    queryFn: () => geofenceService.validate(coords!),
    enabled:
      isAuthenticated &&
      hasPermission("attendance.punch") &&
      Boolean(coords) &&
      (options?.enabled ?? true),
    staleTime: 15_000,
  });
}
