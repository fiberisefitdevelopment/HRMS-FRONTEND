import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type { PermissionRecord } from "@/types/permission";

export const permissionsService = {
  async getPermissions(): Promise<PermissionRecord[]> {
    const { data } = await apiClient.get<ApiResponse<PermissionRecord[]>>("/permissions");
    return data.data;
  },
};
