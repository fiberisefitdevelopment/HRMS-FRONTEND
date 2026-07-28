import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  WorkflowAction,
  WorkflowActionPayload,
  WorkflowDashboard,
  WorkflowDelegatePayload,
  WorkflowInstance,
  WorkflowListParams,
} from "@/types/workflow";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

type ApiInstance = WorkflowInstance & { _id?: string };

type PopulatedActor = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
};

type WorkflowActionApi = Omit<WorkflowAction, "id" | "actorId"> & {
  _id?: string;
  id?: string;
  actorId?: string | PopulatedActor;
};

function normalizeInstance(instance: ApiInstance): WorkflowInstance {
  return { ...instance, id: instance.id ?? instance._id ?? "" };
}

function normalizeWorkflowAction(action: WorkflowActionApi): WorkflowAction {
  const actor =
    action.actor ??
    (typeof action.actorId === "object"
      ? {
          fullName: action.actorId.fullName,
          firstName: action.actorId.firstName,
          lastName: action.actorId.lastName,
          email: action.actorId.email,
        }
      : undefined);

  return {
    ...action,
    id: action.id ?? action._id,
    actorId: typeof action.actorId === "object" ? action.actorId._id ?? action.actorId.id : action.actorId,
    actor,
  };
}

export const workflowService = {
  async getDashboard(): Promise<WorkflowDashboard> {
    const { data } = await apiClient.get<ApiResponse<WorkflowDashboard>>("/workflow/dashboard");
    return {
      ...data.data,
      pendingApprovals: data.data.pendingApprovals.map(normalizeInstance),
      myRequests: data.data.myRequests.map(normalizeInstance),
    };
  },

  async getPending(): Promise<WorkflowInstance[]> {
    const { data } = await apiClient.get<ApiResponse<ApiInstance[]>>("/workflow/pending");
    return data.data.map(normalizeInstance);
  },

  async listInstances(params?: WorkflowListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiInstance>>("/workflow/instances", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data.map(normalizeInstance), meta: normalizeMeta(data.meta) };
  },

  async listByEmployee(userId: string, params?: WorkflowListParams) {
    return this.listInstances({
      ...params,
      workflowType: "leave",
      entityType: "leave_request",
      requesterId: userId,
    });
  },

  async getInstance(id: string): Promise<WorkflowInstance> {
    const { data } = await apiClient.get<ApiResponse<ApiInstance>>(`/workflow/instances/${id}`);
    return normalizeInstance(data.data);
  },

  async getHistory(instanceId: string): Promise<WorkflowAction[]> {
    const { data } = await apiClient.get<ApiResponse<WorkflowActionApi[]>>(
      `/workflow/instances/${instanceId}/history`
    );
    return data.data.map(normalizeWorkflowAction);
  },

  async approve(instanceId: string, payload?: WorkflowActionPayload): Promise<WorkflowInstance> {
    const { data } = await apiClient.put<ApiResponse<ApiInstance>>(
      `/workflow/instances/${instanceId}/approve`,
      payload ?? {}
    );
    return normalizeInstance(data.data);
  },

  async reject(instanceId: string, payload?: WorkflowActionPayload): Promise<WorkflowInstance> {
    const { data } = await apiClient.put<ApiResponse<ApiInstance>>(
      `/workflow/instances/${instanceId}/reject`,
      payload ?? {}
    );
    return normalizeInstance(data.data);
  },

  async cancel(instanceId: string, payload?: WorkflowActionPayload): Promise<WorkflowInstance> {
    const { data } = await apiClient.put<ApiResponse<ApiInstance>>(
      `/workflow/instances/${instanceId}/cancel`,
      payload ?? {}
    );
    return normalizeInstance(data.data);
  },

  async delegate(instanceId: string, payload: WorkflowDelegatePayload): Promise<WorkflowInstance> {
    const { data } = await apiClient.put<ApiResponse<ApiInstance>>(
      `/workflow/instances/${instanceId}/delegate`,
      payload
    );
    return normalizeInstance(data.data);
  },
};
