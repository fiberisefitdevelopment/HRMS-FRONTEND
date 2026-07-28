import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type { Role } from "@/types/role";

export const rolesService = {
  async getRoles(): Promise<Role[]> {
    const { data } = await apiClient.get<ApiResponse<Role[]>>("/roles");
    return data.data;
  },
};
