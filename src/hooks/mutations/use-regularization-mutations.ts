"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regularizationService } from "@/services/regularization/regularization.service";
import type {
  CancelRegularizationPayload,
  RaiseRegularizationPayload,
  RegularizationActionPayload,
} from "@/types/regularization";
import { formatAppliedStatus } from "@/lib/regularization/format";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateRegularization(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["regularization"] });
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
}

export function useRaiseRegularizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RaiseRegularizationPayload) => regularizationService.raise(payload),
    onSuccess: () => {
      invalidateRegularization(queryClient);
      toast.success("Regularization request submitted — view it under Leave → History");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useApproveRegularizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: RegularizationActionPayload }) =>
      regularizationService.approve(id, payload),
    onSuccess: (data) => {
      invalidateRegularization(queryClient);
      const applied = formatAppliedStatus(data.appliedStatus);
      toast.success(
        applied && applied !== "regularized"
          ? `Approved · attendance set to ${applied}`
          : "Regularization approved"
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectRegularizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: RegularizationActionPayload }) =>
      regularizationService.reject(id, payload),
    onSuccess: () => {
      invalidateRegularization(queryClient);
      toast.success("Regularization rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelRegularizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelRegularizationPayload }) =>
      regularizationService.cancel(id, payload),
    onSuccess: () => {
      invalidateRegularization(queryClient);
      toast.success("Regularization request cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
