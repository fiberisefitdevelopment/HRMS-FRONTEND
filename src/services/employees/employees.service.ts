import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  BulkResult,
  CreateEmployeePayload,
  Employee,
  EmployeeListParams,
  ImportResult,
  UpdateEmployeePayload,
} from "@/types/employee";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";
import { downloadBlob, getFilenameFromDisposition } from "@/lib/api/download";
import { postFormData } from "@/lib/api/form-data-upload";

export const employeesService = {
  async list(params?: EmployeeListParams) {
    const { data } = await apiClient.get<PaginatedResponse<Employee>>("/employees", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data.data;
  },

  async getMe(): Promise<Employee> {
    const { data } = await apiClient.get<ApiResponse<Employee>>("/employees/me");
    return data.data;
  },

  async create(payload: CreateEmployeePayload): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>("/employees", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
    const { data } = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },

  async activate(id: string): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>(`/employees/${id}/activate`);
    return data.data;
  },

  async deactivate(id: string): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>(`/employees/${id}/deactivate`);
    return data.data;
  },

  async uploadPhoto(id: string, file: File): Promise<{ profilePhoto: string }> {
    const formData = new FormData();
    formData.append("photo", file);
    return postFormData<{ profilePhoto: string }>(`/employees/${id}/photo`, formData);
  },

  async deletePhoto(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}/photo`);
  },

  async uploadMyPhoto(file: File): Promise<{ profilePhoto: string }> {
    const formData = new FormData();
    formData.append("photo", file);
    return postFormData<{ profilePhoto: string }>("/employees/me/photo", formData);
  },

  async deleteMyPhoto(): Promise<void> {
    await apiClient.delete("/employees/me/photo");
  },

  async importPreview(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    return postFormData<ImportResult>("/employees/import/preview", formData);
  },

  async importExecute(file: File, dryRun = false): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    return postFormData<ImportResult>(
      `/employees/import${dryRun ? "?dryRun=true" : ""}`,
      formData
    );
  },

  async export(
    type: "employees" | "departments" | "designations" | "managers" = "employees",
    format: "xlsx" | "csv" = "xlsx"
  ): Promise<void> {
    const response = await apiClient.get(`/employees/export/${type}`, {
      params: { format },
      responseType: "blob",
    });
    const filename = getFilenameFromDisposition(
      response.headers["content-disposition"],
      `${type}.${format}`
    );
    downloadBlob(response.data, filename);
  },

  async bulkActivate(employeeIds: string[]): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/activate", {
      employeeIds,
    });
    return data.data;
  },

  async bulkDeactivate(employeeIds: string[]): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/deactivate", {
      employeeIds,
    });
    return data.data;
  },

  async bulkDelete(employeeIds: string[]): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/delete", {
      employeeIds,
    });
    return data.data;
  },

  async bulkDepartment(employeeIds: string[], departmentId: string): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/department", {
      employeeIds,
      departmentId,
    });
    return data.data;
  },

  async bulkDesignation(employeeIds: string[], designationId: string): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/designation", {
      employeeIds,
      designationId,
    });
    return data.data;
  },

  async bulkManager(employeeIds: string[], managerId: string | null): Promise<BulkResult> {
    const { data } = await apiClient.post<ApiResponse<BulkResult>>("/employees/bulk/manager", {
      employeeIds,
      managerId,
    });
    return data.data;
  },
};
