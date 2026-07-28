import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateGeofencePayload,
  Geofence,
  UpdateGeofencePayload,
  ValidateGeofencePayload,
  ValidateGeofenceResult,
} from "@/types/geofence";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

export const geofenceService = {
  async list(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const { data } = await apiClient.get<PaginatedResponse<Geofence>>("/geofences", {
      params: {
        ...toListParams(params ?? {}),
        ...(params?.isActive != null ? { isActive: String(params.isActive) } : {}),
      },
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Geofence> {
    const { data } = await apiClient.get<ApiResponse<Geofence>>(`/geofences/${id}`);
    return data.data;
  },

  async create(payload: CreateGeofencePayload): Promise<Geofence> {
    const { data } = await apiClient.post<ApiResponse<Geofence>>("/geofences", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateGeofencePayload): Promise<Geofence> {
    const { data } = await apiClient.put<ApiResponse<Geofence>>(`/geofences/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/geofences/${id}`);
  },

  async validate(payload: ValidateGeofencePayload): Promise<ValidateGeofenceResult> {
    const { data } = await apiClient.post<ApiResponse<ValidateGeofenceResult>>(
      "/geofences/validate",
      payload
    );
    return data.data;
  },
};
