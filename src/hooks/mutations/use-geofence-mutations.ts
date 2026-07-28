"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { geofenceService } from "@/services/geofence/geofence.service";
import { attendancePolicyService } from "@/services/attendance/attendance-policy.service";
import type {
  CreateGeofencePayload,
  UpdateAttendancePolicyPayload,
  UpdateGeofencePayload,
} from "@/types/geofence";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateGeofenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGeofencePayload) => geofenceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
      toast.success("Office geofence created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateGeofenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGeofencePayload }) =>
      geofenceService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.geofence.detail(id) });
      toast.success("Office geofence updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteGeofenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => geofenceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
      toast.success("Office geofence deactivated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateAttendancePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAttendancePolicyPayload) => attendancePolicyService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attendance.policy });
      toast.success("Attendance policy updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
