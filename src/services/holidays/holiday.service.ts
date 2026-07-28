import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";

export interface Holiday {
  id: string;
  holidayName: string;
  holidayDate: string;
  description?: string;
  holidayCode?: string | null;
  location?: string;
  /** Aliases */
  name?: string;
  date?: string;
}

export const holidayService = {
  async list(params?: { year?: number; upcoming?: boolean; companyId?: string; companyCode?: string }): Promise<Holiday[]> {
    const { data } = await apiClient.get<ApiResponse<Holiday[]>>("/holidays", {
      params,
    });
    return data.data ?? [];
  },
};
