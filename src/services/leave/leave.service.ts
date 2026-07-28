import { apiClient } from "@/services/api/client";
import { postFormData } from "@/lib/api/form-data-upload";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  ApplyLeavePayload,
  BulkApplyLeavePayload,
  BulkApplyLeaveResult,
  BulkCreditLeaveBalancePayload,
  BulkCreditLeaveBalanceResult,
  CancelLeavePayload,
  CreditLeaveBalancePayload,
  CreditLeaveBalanceResult,
  LeaveActionPayload,
  LeaveBalance,
  LeaveCalendar,
  LeaveLedgerEntry,
  LeaveListParams,
  LeaveMonthlySummary,
  LeaveReportParams,
  LeaveReportResult,
  LeaveReportType,
  LeaveRequest,
} from "@/types/leave";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";
import { downloadBlob, getFilenameFromDisposition } from "@/lib/api/download";

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

type ApiLeave = Omit<
  LeaveRequest,
  "id" | "userId" | "employeeProfileId" | "workflowInstanceId" | "createdBy"
> & {
  _id?: string;
  id?: string;
  userId?: string | PopulatedUser;
  employeeProfileId?: string | PopulatedEmployee;
  workflowInstanceId?: string | { _id?: string; id?: string };
  createdBy?: string | PopulatedUser;
  source?: LeaveRequest["source"];
};

function normalizeLeave(leave: ApiLeave): LeaveRequest {
  const userRef = leave.user;
  const userFromId =
    leave.userId && typeof leave.userId === "object"
      ? {
          fullName: leave.userId.fullName,
          firstName: leave.userId.firstName,
          lastName: leave.userId.lastName,
          email: leave.userId.email,
        }
      : undefined;

  const employeeRef = leave.employee;
  const employeeFromProfile =
    leave.employeeProfileId && typeof leave.employeeProfileId === "object"
      ? {
          employeeId: leave.employeeProfileId.employeeId,
        }
      : undefined;

  return {
    ...leave,
    id: leave.id ?? leave._id ?? "",
    userId:
      typeof leave.userId === "object"
        ? leave.userId._id ?? leave.userId.id
        : leave.userId,
    employeeProfileId:
      typeof leave.employeeProfileId === "object"
        ? leave.employeeProfileId._id ?? leave.employeeProfileId.id
        : leave.employeeProfileId,
    workflowInstanceId:
      typeof leave.workflowInstanceId === "object"
        ? leave.workflowInstanceId._id ?? leave.workflowInstanceId.id
        : leave.workflowInstanceId,
    createdBy:
      typeof leave.createdBy === "object"
        ? leave.createdBy._id ?? leave.createdBy.id
        : leave.createdBy,
    source: leave.source ?? "self",
    user: userRef ?? userFromId,
    employee: employeeRef ?? employeeFromProfile,
  };
}

export const leaveService = {
  async apply(payload: ApplyLeavePayload): Promise<LeaveRequest> {
    const { prescriptionFile, attachments, ...rest } = payload;

    if (prescriptionFile) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
          return;
        }
        formData.append(key, String(value));
      });
      if (attachments?.length) {
        formData.append("attachments", JSON.stringify(attachments));
      }
      formData.append("prescription", prescriptionFile);

      return postFormData<ApiLeave>("/leave", formData).then(normalizeLeave);
    }

    const { data } = await apiClient.post<ApiResponse<ApiLeave>>("/leave", {
      ...rest,
      ...(attachments?.length ? { attachments } : {}),
    });
    return normalizeLeave(data.data);
  },

  async bulkApply(payload: BulkApplyLeavePayload): Promise<BulkApplyLeaveResult> {
    const { data } = await apiClient.post<
      ApiResponse<{
        success: number;
        failed: number;
        leaves: ApiLeave[];
        errors: BulkApplyLeaveResult["errors"];
      }>
    >("/leave/bulk", payload);
    return {
      success: data.data.success,
      failed: data.data.failed,
      leaves: (data.data.leaves ?? []).map(normalizeLeave),
      errors: data.data.errors ?? [],
    };
  },

  async creditBalance(payload: CreditLeaveBalancePayload): Promise<CreditLeaveBalanceResult> {
    const { data } = await apiClient.post<ApiResponse<CreditLeaveBalanceResult>>(
      "/leave/balances/credit",
      payload
    );
    return data.data;
  },

  async bulkCreditBalance(
    payload: BulkCreditLeaveBalancePayload
  ): Promise<BulkCreditLeaveBalanceResult> {
    const { data } = await apiClient.post<ApiResponse<BulkCreditLeaveBalanceResult>>(
      "/leave/balances/credit/bulk",
      payload
    );
    return data.data;
  },

  async list(params?: LeaveListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiLeave>>("/leave", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data.map(normalizeLeave), meta: normalizeMeta(data.meta) };
  },

  async listByEmployee(employeeProfileId: string, params?: LeaveListParams) {
    return this.list({ ...params, employeeProfileId });
  },

  async getById(id: string): Promise<LeaveRequest> {
    const { data } = await apiClient.get<ApiResponse<ApiLeave>>(`/leave/${id}`);
    return normalizeLeave(data.data);
  },

  async approve(id: string, payload?: LeaveActionPayload): Promise<LeaveRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiLeave>>(
      `/leave/${id}/approve`,
      payload ?? {}
    );
    return normalizeLeave(data.data);
  },

  async reject(id: string, payload?: LeaveActionPayload): Promise<LeaveRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiLeave>>(
      `/leave/${id}/reject`,
      payload ?? {}
    );
    return normalizeLeave(data.data);
  },

  async cancel(id: string, payload?: CancelLeavePayload): Promise<LeaveRequest> {
    const { data } = await apiClient.put<ApiResponse<ApiLeave>>(
      `/leave/${id}/cancel`,
      payload ?? {}
    );
    return normalizeLeave(data.data);
  },

  async getBalances(userId?: string): Promise<LeaveBalance[]> {
    const { data } = await apiClient.get<ApiResponse<LeaveBalance[]>>("/leave/balances", {
      params: userId ? { userId } : undefined,
    });
    return data.data;
  },

  async getLedger(params?: { page?: number; limit?: number; leaveTypeCode?: string }) {
    const { data } = await apiClient.get<PaginatedResponse<LeaveLedgerEntry>>("/leave/ledger", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async getCalendar(year: number, month: number, scope?: "self" | "team"): Promise<LeaveCalendar> {
    const { data } = await apiClient.get<ApiResponse<LeaveCalendar>>("/leave/calendar", {
      params: { year, month, ...(scope ? { scope } : {}) },
    });
    return data.data;
  },

  async getMonthlySummary(year?: number, month?: number): Promise<LeaveMonthlySummary> {
    const { data } = await apiClient.get<ApiResponse<LeaveMonthlySummary>>(
      "/leave/monthly-summary",
      { params: { year, month } }
    );
    return data.data;
  },

  async getReport(type: LeaveReportType, params?: LeaveReportParams): Promise<LeaveReportResult> {
    const { data } = await apiClient.get<ApiResponse<LeaveReportResult>>(`/leave/reports/${type}`, {
      params: params ?? {},
    });
    return data.data;
  },

  async exportReport(
    type: LeaveReportType,
    format: "xlsx" | "csv",
    params?: LeaveReportParams
  ): Promise<void> {
    const response = await apiClient.get(`/leave/export/${type}`, {
      params: { ...(params ?? {}), format },
      responseType: "blob",
    });
    const filename =
      getFilenameFromDisposition(response.headers["content-disposition"]) ??
      `leave-${type}.${format === "xlsx" ? "xlsx" : "csv"}`;
    downloadBlob(response.data, filename);
  },
};
