import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AssignManagerPayload,
  ManagerTeamParams,
  RemoveManagerPayload,
  TeamMember,
} from "@/types/manager";
import type { Employee } from "@/types/employee";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

export const managersService = {
  async assign(payload: AssignManagerPayload): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>("/managers/assign", payload);
    return data.data;
  },

  async change(payload: AssignManagerPayload): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>("/managers/change", payload);
    return data.data;
  },

  async remove(payload: RemoveManagerPayload): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>("/managers/remove", payload);
    return data.data;
  },

  async getTeam(params?: ManagerTeamParams) {
    const { data } = await apiClient.get<PaginatedResponse<TeamMember>>("/managers/team", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getManagerTeam(managerId: string, params?: ManagerTeamParams) {
    const { data } = await apiClient.get<PaginatedResponse<TeamMember>>(
      `/managers/${managerId}/team`,
      { params: toListParams(params ?? {}) }
    );
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },
};
