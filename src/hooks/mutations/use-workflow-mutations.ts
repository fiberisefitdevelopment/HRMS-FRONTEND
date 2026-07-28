"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowService } from "@/services/workflow/workflow.service";
import type { WorkflowActionPayload, WorkflowDelegatePayload } from "@/types/workflow";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateWorkflow(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["workflow"] });
  queryClient.invalidateQueries({ queryKey: ["comp-off"] });
}

export function useApproveWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: WorkflowActionPayload }) =>
      workflowService.approve(id, payload),
    onSuccess: () => {
      invalidateWorkflow(queryClient);
      toast.success("Request approved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: WorkflowActionPayload }) =>
      workflowService.reject(id, payload),
    onSuccess: () => {
      invalidateWorkflow(queryClient);
      toast.success("Request rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: WorkflowActionPayload }) =>
      workflowService.cancel(id, payload),
    onSuccess: () => {
      invalidateWorkflow(queryClient);
      toast.success("Request cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDelegateWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkflowDelegatePayload }) =>
      workflowService.delegate(id, payload),
    onSuccess: () => {
      invalidateWorkflow(queryClient);
      toast.success("Request delegated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
