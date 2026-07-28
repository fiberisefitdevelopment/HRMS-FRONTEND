"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { designationsService } from "@/services/designations/designations.service";
import type { CreateDesignationPayload, UpdateDesignationPayload } from "@/types/designation";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDesignationPayload) => designationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDesignationPayload }) =>
      designationsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
