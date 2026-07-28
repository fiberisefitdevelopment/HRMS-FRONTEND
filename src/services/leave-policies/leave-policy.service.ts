import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type { LeavePolicy, UpdateLeavePolicyPayload } from "@/types/leave-policy";

type ApiPolicy = LeavePolicy & { _id?: string };

function normalizePolicy(policy: ApiPolicy): LeavePolicy {
  return { ...policy, id: policy.id ?? policy._id };
}

export const leavePolicyService = {
  async get(): Promise<LeavePolicy> {
    const { data } = await apiClient.get<ApiResponse<ApiPolicy>>("/leave-policies");
    return normalizePolicy(data.data);
  },

  async update(payload: UpdateLeavePolicyPayload): Promise<LeavePolicy> {
    const { data } = await apiClient.put<ApiResponse<ApiPolicy>>("/leave-policies", payload);
    return normalizePolicy(data.data);
  },
};
