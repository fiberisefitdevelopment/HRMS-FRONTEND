"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wfhService } from "@/services/wfh/wfh.service";
import type { ApplyWfhPayload, WfhActionPayload } from "@/types/wfh";
import { getErrorMessage, getFieldErrors } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateWfh(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["wfh"] });
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
}

export function useApplyWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyWfhPayload) => wfhService.apply(payload),
    onSuccess: () => {
      invalidateWfh(queryClient);
      toast.success("Work from home request submitted for approval");
    },
    onError: (error) => {
      const fields = getFieldErrors(error);
      if (fields) {
        const first = Object.values(fields)[0]?.[0];
        toast.error(first ?? getErrorMessage(error));
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
}

export function useApproveWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: WfhActionPayload }) =>
      wfhService.approve(id, payload),
    onSuccess: () => {
      invalidateWfh(queryClient);
      toast.success("Work from home approved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: WfhActionPayload }) =>
      wfhService.reject(id, payload),
    onSuccess: () => {
      invalidateWfh(queryClient);
      toast.success("Work from home rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
