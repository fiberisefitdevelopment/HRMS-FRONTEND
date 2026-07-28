"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftsService } from "@/services/shifts/shifts.service";
import type {
  AssignShiftPayload,
  CreateShiftPayload,
  UnassignShiftPayload,
  UpdateShiftPayload,
} from "@/types/shift";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateShiftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShiftPayload) => shiftsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateShiftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShiftPayload }) =>
      shiftsService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shift.detail(id) });
      toast.success("Shift updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteShiftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAssignShiftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignShiftPayload) => shiftsService.assign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift assigned");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUnassignShiftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnassignShiftPayload) => shiftsService.unassign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift unassigned");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
