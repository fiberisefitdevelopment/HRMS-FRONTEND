"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesService } from "@/services/employees/employees.service";
import type { CreateEmployeePayload, UpdateEmployeePayload } from "@/types/employee";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeesService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created");
      if (data.temporaryPassword) {
        toast.info(`Temporary password: ${data.temporaryPassword}`, { duration: 10000 });
      }
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      employeesService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employee.detail(id) });
      toast.success("Employee updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useActivateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee activated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeactivateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deactivated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      employeesService.uploadPhoto(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employee.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Photo uploaded");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.deletePhoto(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employee.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Photo removed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadMyPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeesService.uploadMyPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employee.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.session });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      toast.success("Photo uploaded");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteMyPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => employeesService.deleteMyPhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employee.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.session });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      toast.success("Photo removed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useImportPreviewMutation() {
  return useMutation({
    mutationFn: (file: File) => employeesService.importPreview(file),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useImportExecuteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeesService.importExecute(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`Import complete: ${result.summary.imported} imported, ${result.summary.failed} failed`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportEmployeesMutation() {
  return useMutation({
    mutationFn: ({ type, format }: { type?: "employees" | "departments" | "designations" | "managers"; format?: "xlsx" | "csv" }) =>
      employeesService.export(type ?? "employees", format ?? "xlsx"),
    onSuccess: () => toast.success("Export downloaded"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkActivateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeIds: string[]) => employeesService.bulkActivate(employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Bulk activation completed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkDeactivateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeIds: string[]) => employeesService.bulkDeactivate(employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Bulk deactivation completed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeIds: string[]) => employeesService.bulkDelete(employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Bulk delete completed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeIds, departmentId }: { employeeIds: string[]; departmentId: string }) =>
      employeesService.bulkDepartment(employeeIds, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Department updated for selected employees");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeIds, designationId }: { employeeIds: string[]; designationId: string }) =>
      employeesService.bulkDesignation(employeeIds, designationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Designation updated for selected employees");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkManagerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeIds, managerId }: { employeeIds: string[]; managerId: string | null }) =>
      employeesService.bulkManager(employeeIds, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Manager updated for selected employees");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
