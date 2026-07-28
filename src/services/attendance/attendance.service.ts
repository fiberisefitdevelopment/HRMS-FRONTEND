import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AttendanceDashboardEmployee,
  AttendanceDashboardHr,
  AttendanceDashboardManager,
  AttendanceListParams,
  AttendanceMonthlySummary,
  AttendanceRecord,
  AttendanceReportParams,
  AttendanceReportResult,
  AttendanceToday,
  BreakPayload,
  CorrectAttendancePayload,
  CorrectAttendanceByDatePayload,
  LocationHeartbeatPayload,
  ManagerLiveDashboard,
  MusterRoll,
  MusterRollParams,
  PunchPayload,
  ReportType,
} from "@/types/attendance";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";
import { downloadBlob, getFilenameFromDisposition } from "@/lib/api/download";

export const attendanceService = {
  async getToday(): Promise<AttendanceToday> {
    const { data } = await apiClient.get<ApiResponse<AttendanceToday>>("/attendance/today");
    return data.data;
  },

  async list(params?: AttendanceListParams) {
    const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>("/attendance", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data, meta: normalizeMeta(data.meta) };
  },

  async listByEmployee(employeeProfileId: string, params?: { page?: number; limit?: number }) {
    return this.list({ ...params, employeeProfileId });
  },

  async punchIn(payload?: PunchPayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendance/punch-in",
      payload ?? {}
    );
    return data.data;
  },

  async punchOut(payload?: PunchPayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendance/punch-out",
      payload ?? {}
    );
    return data.data;
  },

  async updateLocation(payload: LocationHeartbeatPayload): Promise<{
    lastKnownLocation: unknown;
    attendanceStatus: string;
    hasOpenSession: boolean;
  }> {
    const { data } = await apiClient.post<
      ApiResponse<{
        lastKnownLocation: unknown;
        attendanceStatus: string;
        hasOpenSession: boolean;
      }>
    >("/attendance/location", payload);
    return data.data;
  },

  async getManagerLiveDashboard(): Promise<ManagerLiveDashboard> {
    const { data } = await apiClient.get<ApiResponse<ManagerLiveDashboard>>(
      "/attendance/dashboard/manager/live"
    );
    return data.data;
  },

  async breakStart(payload: BreakPayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendance/break/start",
      payload
    );
    return data.data;
  },

  async breakEnd(payload: BreakPayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendance/break/end",
      payload
    );
    return data.data;
  },

  async correct(id: string, payload: CorrectAttendancePayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.put<ApiResponse<AttendanceRecord>>(
      `/attendance/${id}/correct`,
      payload
    );
    return data.data;
  },

  async correctByDate(payload: CorrectAttendanceByDatePayload): Promise<AttendanceRecord> {
    const { data } = await apiClient.put<ApiResponse<AttendanceRecord>>(
      "/attendance/correct-by-date",
      payload
    );
    return data.data;
  },

  async getEmployeeDashboard(): Promise<AttendanceDashboardEmployee> {
    const { data } = await apiClient.get<ApiResponse<AttendanceDashboardEmployee>>(
      "/attendance/dashboard/employee"
    );
    return data.data;
  },

  async getHrDashboard(): Promise<AttendanceDashboardHr> {
    const { data } = await apiClient.get<ApiResponse<AttendanceDashboardHr>>(
      "/attendance/dashboard/hr"
    );
    return data.data;
  },

  async getManagerDashboard(): Promise<AttendanceDashboardManager> {
    const { data } = await apiClient.get<ApiResponse<AttendanceDashboardManager>>(
      "/attendance/dashboard/manager"
    );
    return data.data;
  },

  async getMonthlySummary(
    year: number,
    month: number,
    params?: Pick<AttendanceListParams, "userId" | "employeeProfileId">
  ): Promise<AttendanceMonthlySummary> {
    const { data } = await apiClient.get<ApiResponse<AttendanceMonthlySummary>>(
      "/attendance/monthly-summary",
      { params: { year, month, ...(params ?? {}) } }
    );
    return data.data;
  },

  async getMusterRoll(params: MusterRollParams): Promise<MusterRoll> {
    const { data } = await apiClient.get<ApiResponse<MusterRoll>>("/attendance/muster-roll", {
      params,
    });
    return data.data;
  },

  async getReport(type: ReportType, params?: AttendanceReportParams): Promise<AttendanceReportResult> {
    const { data } = await apiClient.get<ApiResponse<AttendanceReportResult>>(
      `/attendance/reports/${type}`,
      { params: toListParams(params ?? {}) }
    );
    return data.data;
  },

  async exportReport(
    type: ReportType = "daily",
    format: "xlsx" | "csv" = "xlsx",
    params?: AttendanceReportParams
  ): Promise<void> {
    const response = await apiClient.get(`/attendance/export/${type}`, {
      params: { ...toListParams(params ?? {}), format },
      responseType: "blob",
    });
    const filename = getFilenameFromDisposition(
      response.headers["content-disposition"],
      `attendance-${type}.${format}`
    );
    downloadBlob(response.data, filename);
  },
};
