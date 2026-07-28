import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateDesignationPayload,
  Designation,
  DesignationListParams,
  UpdateDesignationPayload,
} from "@/types/designation";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

export const designationsService = {
  async list(params?: DesignationListParams) {
    const query = toListParams({
      ...params,
      ...(params?.isActive !== undefined ? { isActive: String(params.isActive) } : {}),
    });
    const { data } = await apiClient.get<PaginatedResponse<Designation>>("/designations", {
      params: query,
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Designation> {
    const { data } = await apiClient.get<ApiResponse<Designation>>(`/designations/${id}`);
    return data.data;
  },

  async create(payload: CreateDesignationPayload): Promise<Designation> {
    const { data } = await apiClient.post<ApiResponse<Designation>>("/designations", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateDesignationPayload): Promise<Designation> {
    const { data } = await apiClient.put<ApiResponse<Designation>>(`/designations/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/designations/${id}`);
  },
};
