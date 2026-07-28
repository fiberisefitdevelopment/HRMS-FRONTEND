import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ApplyWfhPayload, WfhActionPayload, WfhListParams, WfhRequest } from "@/types/wfh";
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

type ApiWfh = Omit<WfhRequest, "id" | "userId" | "employeeProfileId"> & {
  _id?: string;
  id?: string;
  userId?: string | PopulatedUser;
  employeeProfileId?: string | PopulatedEmployee;
};

function normalizeUser(u?: PopulatedUser | null) {
  if (!u) return null;
  return {
    id: u.id ?? u._id,
    fullName: u.fullName,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
  };
}

function normalizeWfh(doc: ApiWfh): WfhRequest {
  const userFromId =
    doc.userId && typeof doc.userId === "object" ? normalizeUser(doc.userId) : undefined;
  const employeeFromProfile =
    doc.employeeProfileId && typeof doc.employeeProfileId === "object"
      ? {
          id: doc.employeeProfileId.id ?? doc.employeeProfileId._id,
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
    user: doc.user ?? userFromId ?? null,
    employee: doc.employee ?? employeeFromProfile ?? null,
    date: doc.date,
    reason: doc.reason ?? "",
    status: doc.status,
  };
}

export const wfhService = {
  async apply(payload: ApplyWfhPayload): Promise<WfhRequest> {
    const { data } = await apiClient.post<ApiResponse<ApiWfh>>("/wfh", {
      date: payload.date,
      ...(payload.reason?.trim() ? { reason: payload.reason.trim() } : {}),
    });
    return normalizeWfh(data.data);
  },

  async list(params?: WfhListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiWfh>>("/wfh", {
      params: toListParams(params ?? {}),
    });
    return {
      data: (data.data ?? []).map(normalizeWfh),
      meta: normalizeMeta(data.meta ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 }),
    };
  },

  async getById(id: string): Promise<WfhRequest> {
    const { data } = await apiClient.get<ApiResponse<ApiWfh>>(`/wfh/${id}`);
    return normalizeWfh(data.data);
  },

  async approve(id: string, payload?: WfhActionPayload): Promise<WfhRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiWfh>>(`/wfh/${id}/approve`, payload ?? {});
    return normalizeWfh(data.data);
  },

  async reject(id: string, payload?: WfhActionPayload): Promise<WfhRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiWfh>>(`/wfh/${id}/reject`, payload ?? {});
    return normalizeWfh(data.data);
  },
};
