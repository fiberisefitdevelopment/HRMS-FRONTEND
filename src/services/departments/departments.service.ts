import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentListParams,
  UpdateDepartmentPayload,
} from "@/types/department";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

export const departmentsService = {
  async list(params?: DepartmentListParams) {
    const query = toListParams({
      ...params,
      ...(params?.isActive !== undefined ? { isActive: String(params.isActive) } : {}),
    });
    const { data } = await apiClient.get<PaginatedResponse<Department>>("/departments", { params: query });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Department> {
    const { data } = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return data.data;
  },

  async create(payload: CreateDepartmentPayload): Promise<Department> {
    const { data } = await apiClient.post<ApiResponse<Department>>("/departments", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
    const { data } = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },
};
