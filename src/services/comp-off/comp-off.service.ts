import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CancelCompOffPayload,
  CompOffEligibility,
  CompOffListParams,
  CompOffRequest,
  RaiseCompOffPayload,
} from "@/types/comp-off";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

type PopulatedUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
};

type PopulatedEmployee = {
  _id?: string;
  id?: string;
  employeeId?: string;
};

type ApiCompOff = Omit<
  CompOffRequest,
  "id" | "userId" | "employeeProfileId" | "workflowInstanceId"
> & {
  _id?: string;
  id?: string;
  userId?: string | PopulatedUser;
  employeeProfileId?: string | PopulatedEmployee;
  workflowInstanceId?: string | { _id?: string; id?: string };
};

function normalizeCompOff(doc: ApiCompOff): CompOffRequest {
  const userFromId =
    doc.userId && typeof doc.userId === "object"
      ? {
          id: doc.userId._id ?? doc.userId.id,
          fullName: doc.userId.fullName,
          firstName: doc.userId.firstName,
          lastName: doc.userId.lastName,
          email: doc.userId.email,
        }
      : undefined;

  const employeeFromProfile =
    doc.employeeProfileId && typeof doc.employeeProfileId === "object"
      ? {
          id: doc.employeeProfileId._id ?? doc.employeeProfileId.id,
          employeeId: doc.employeeProfileId.employeeId,
        }
      : undefined;

  return {
    ...doc,
    id: doc.id ?? doc._id ?? "",
    userId:
      typeof doc.userId === "object" ? doc.userId._id ?? doc.userId.id : doc.userId,
    employeeProfileId:
      typeof doc.employeeProfileId === "object"
        ? doc.employeeProfileId._id ?? doc.employeeProfileId.id
        : doc.employeeProfileId,
    workflowInstanceId:
      typeof doc.workflowInstanceId === "object"
        ? doc.workflowInstanceId._id ?? doc.workflowInstanceId.id
        : doc.workflowInstanceId,
    user: doc.user ?? userFromId,
    employee: doc.employee ?? employeeFromProfile,
  };
}

function toDateQuery(date?: string | Date): string | undefined {
  if (!date) return undefined;
  if (typeof date === "string") return date.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const compOffService = {
  async getEligibility(date?: string): Promise<CompOffEligibility> {
    const { data } = await apiClient.get<ApiResponse<CompOffEligibility>>("/comp-off/eligibility", {
      params: date ? { date: toDateQuery(date) } : undefined,
    });
    return data.data;
  },

  async raise(payload: RaiseCompOffPayload): Promise<CompOffRequest> {
    const body = {
      reason: payload.reason,
      ...(payload.date ? { date: toDateQuery(payload.date) } : {}),
    };
    const { data } = await apiClient.post<ApiResponse<ApiCompOff>>("/comp-off", body);
    return normalizeCompOff(data.data);
  },

  async list(params?: CompOffListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiCompOff>>("/comp-off", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data.map(normalizeCompOff), meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<CompOffRequest> {
    const { data } = await apiClient.get<ApiResponse<ApiCompOff>>(`/comp-off/${id}`);
    return normalizeCompOff(data.data);
  },

  async cancel(id: string, payload?: CancelCompOffPayload): Promise<CompOffRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiCompOff>>(
      `/comp-off/${id}/cancel`,
      payload ?? {}
    );
    return normalizeCompOff(data.data);
  },
};
