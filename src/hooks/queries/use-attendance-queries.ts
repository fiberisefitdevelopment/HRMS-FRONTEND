"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance/attendance.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type {
  AttendanceListParams,
  AttendanceReportParams,
  MusterRollParams,
  ReportType,
} from "@/types/attendance";

export function useAttendanceTodayQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.attendance.today,
    queryFn: () => attendanceService.getToday(),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}

export function useAttendanceListQuery(params?: AttendanceListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { hasPermission } = usePermissions();
  const isEmployee = user?.role === "employee";
  const scopedParams = isEmployee && user?.id ? { ...params, userId: user.id } : params;

  return useQuery({
    queryKey: QUERY_KEYS.attendance.all(scopedParams),
    queryFn: () => attendanceService.list(scopedParams),
    enabled: isAuthenticated && hasPermission("attendance.view"),
    placeholderData: (prev) => prev,
  });
}

export function useEmployeeAttendanceDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.dashboardEmployee,
    queryFn: () => attendanceService.getEmployeeDashboard(),
    enabled: isAuthenticated && hasPermission("attendance.dashboard"),
  });
}

export function useHrAttendanceDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission, hasRole } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.dashboardHr,
    queryFn: () => attendanceService.getHrDashboard(),
    enabled:
      isAuthenticated &&
      hasPermission("attendance.dashboard") &&
      (hasRole(["hr", "owner"]) || hasPermission("attendance.report")),
  });
}

export function useManagerAttendanceDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission, hasRole } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.dashboardManager,
    queryFn: () => attendanceService.getManagerDashboard(),
    enabled: isAuthenticated && hasPermission("attendance.dashboard") && hasRole("manager"),
  });
}

export function useAttendanceMonthlySummaryQuery(year: number, month: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isEmployee = user?.role === "employee";
  const scopedParams = isEmployee && user?.id ? { userId: user.id } : undefined;

  return useQuery({
    queryKey: QUERY_KEYS.attendance.monthlySummary(year, month, scopedParams),
    queryFn: () => attendanceService.getMonthlySummary(year, month, scopedParams),
    enabled: isAuthenticated && year > 0 && month >= 1 && month <= 12,
  });
}

export function useMusterRollQuery(params: MusterRollParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.musterRoll(params),
    queryFn: () => attendanceService.getMusterRoll(params),
    enabled: isAuthenticated && hasPermission("attendance.report"),
    placeholderData: (prev) => prev,
  });
}

export function useAttendanceReportQuery(type: ReportType, params?: AttendanceReportParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.report(type, params),
    queryFn: () => attendanceService.getReport(type, params),
    enabled: isAuthenticated && hasPermission("attendance.report"),
  });
}

export function useManagerLiveDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.attendance.managerLive,
    queryFn: () => attendanceService.getManagerLiveDashboard(),
    enabled: isAuthenticated && hasPermission("attendance.dashboard"),
    refetchInterval: 45_000,
  });
}
