"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments/departments.service";
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/department";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
      departmentsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
