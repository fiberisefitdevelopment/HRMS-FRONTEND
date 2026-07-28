import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AttendancePolicy,
  UpdateAttendancePolicyPayload,
} from "@/types/geofence";

export const attendancePolicyService = {
  async get(): Promise<AttendancePolicy> {
    const { data } = await apiClient.get<ApiResponse<AttendancePolicy>>("/attendance-policies");
    return data.data;
  },

  async update(payload: UpdateAttendancePolicyPayload): Promise<AttendancePolicy> {
    const { data } = await apiClient.put<ApiResponse<AttendancePolicy>>(
      "/attendance-policies",
      payload
    );
    return data.data;
  },
};
