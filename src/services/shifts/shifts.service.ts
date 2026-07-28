import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AssignShiftPayload,
  CreateShiftPayload,
  Shift,
  ShiftAssignment,
  ShiftListParams,
  UnassignShiftPayload,
  UpdateShiftPayload,
} from "@/types/shift";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

export const shiftsService = {
  async list(params?: ShiftListParams) {
    const { data } = await apiClient.get<PaginatedResponse<Shift>>("/shifts", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Shift> {
    const { data } = await apiClient.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return data.data;
  },

  async create(payload: CreateShiftPayload): Promise<Shift> {
    const { data } = await apiClient.post<ApiResponse<Shift>>("/shifts", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateShiftPayload): Promise<Shift> {
    const { data } = await apiClient.put<ApiResponse<Shift>>(`/shifts/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shifts/${id}`);
  },

  async assign(payload: AssignShiftPayload): Promise<ShiftAssignment> {
    const { data } = await apiClient.post<ApiResponse<ShiftAssignment>>("/shifts/assign", payload);
    return data.data;
  },

  async unassign(payload: UnassignShiftPayload): Promise<void> {
    await apiClient.post("/shifts/unassign", payload);
  },
};
