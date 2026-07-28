import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CancelRegularizationPayload,
  RaiseRegularizationPayload,
  RegularizationActionPayload,
  RegularizationActor,
  RegularizationEligibility,
  RegularizationListParams,
  RegularizationRequest,
} from "@/types/regularization";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";
import {
  formatRegularizationPunchTime,
  normalizeRegularizationEligibility,
} from "@/lib/regularization/format";

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

type ApiRegularization = Omit<
  RegularizationRequest,
  "id" | "userId" | "employeeProfileId" | "date" | "approvedBy" | "rejectedBy"
> & {
  _id?: string;
  id?: string;
  date?: string | null;
  attendanceDate?: string | null;
  userId?: string | PopulatedUser;
  employeeProfileId?: string | PopulatedEmployee;
  approvedBy?: string | PopulatedUser | null;
  rejectedBy?: string | PopulatedUser | null;
  approvedByName?: string | null;
  rejectedByName?: string | null;
};

function toActor(value?: string | PopulatedUser | null): RegularizationActor | string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return {
    id: value._id ?? value.id,
    fullName: value.fullName,
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
  };
}

function resolveDate(doc: ApiRegularization): string {
  const candidates = [
    doc.date,
    doc.attendanceDate,
    doc.punchInAt,
    doc.requestedPunchIn,
    doc.createdAt,
  ];
  for (const value of candidates) {
    if (!value) continue;
    const sliced = String(value).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) return sliced;
  }
  return "";
}

function normalizeRegularization(doc: ApiRegularization): RegularizationRequest {
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

  const date = resolveDate(doc);
  const punchInDisplay =
    doc.punchInAt || doc.punchInDisplay
      ? formatRegularizationPunchTime(doc.punchInAt, doc.punchInDisplay)
      : doc.punchInDisplay;

  return {
    ...doc,
    id: doc.id ?? doc._id ?? "",
    date,
    attendanceDate: doc.attendanceDate ?? (date || null),
    punchInDisplay,
    userId:
      typeof doc.userId === "object" ? doc.userId._id ?? doc.userId.id : doc.userId,
    employeeProfileId:
      typeof doc.employeeProfileId === "object"
        ? doc.employeeProfileId._id ?? doc.employeeProfileId.id
        : doc.employeeProfileId,
    user: doc.user ?? userFromId,
    employee: doc.employee ?? employeeFromProfile,
    approvedBy: toActor(doc.approvedBy),
    rejectedBy: toActor(doc.rejectedBy),
    approvedByName: doc.approvedByName ?? undefined,
    rejectedByName: doc.rejectedByName ?? undefined,
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

export const regularizationService = {
  async getEligibility(date?: string): Promise<RegularizationEligibility> {
    const { data } = await apiClient.get<ApiResponse<RegularizationEligibility>>(
      "/regularization/eligibility",
      { params: date ? { date: toDateQuery(date) } : undefined }
    );
    return normalizeRegularizationEligibility(data.data);
  },

  async raise(payload: RaiseRegularizationPayload): Promise<RegularizationRequest> {
    const body = {
      reason: payload.reason,
      ...(payload.date ? { date: toDateQuery(payload.date) } : {}),
      ...(payload.requestedPunchIn ? { requestedPunchIn: payload.requestedPunchIn } : {}),
      ...(payload.requestedPunchOut ? { requestedPunchOut: payload.requestedPunchOut } : {}),
    };
    const { data } = await apiClient.post<ApiResponse<ApiRegularization>>(
      "/regularization",
      body
    );
    return normalizeRegularization(data.data);
  },

  async list(params?: RegularizationListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiRegularization>>(
      "/regularization",
      { params: toListParams(params ?? {}) }
    );
    return {
      data: data.data.map(normalizeRegularization),
      meta: normalizeMeta(data.meta),
    };
  },

  async getById(id: string): Promise<RegularizationRequest> {
    const { data } = await apiClient.get<ApiResponse<ApiRegularization>>(
      `/regularization/${id}`
    );
    return normalizeRegularization(data.data);
  },

  async approve(
    id: string,
    payload?: RegularizationActionPayload
  ): Promise<RegularizationRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiRegularization>>(
      `/regularization/${id}/approve`,
      payload ?? {}
    );
    return normalizeRegularization(data.data);
  },

  async reject(
    id: string,
    payload?: RegularizationActionPayload
  ): Promise<RegularizationRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiRegularization>>(
      `/regularization/${id}/reject`,
      payload ?? {}
    );
    return normalizeRegularization(data.data);
  },

  async cancel(
    id: string,
    payload?: CancelRegularizationPayload
  ): Promise<RegularizationRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiRegularization>>(
      `/regularization/${id}/cancel`,
      payload ?? {}
    );
    return normalizeRegularization(data.data);
  },
};
