"use client";

import { useQuery } from "@tanstack/react-query";
import { leaveService } from "@/services/leave/leave.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { LeaveListParams, LeaveReportParams, LeaveReportType } from "@/types/leave";

export function useLeaveListQuery(params?: LeaveListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.all(params),
    queryFn: () => leaveService.list(params),
    enabled: isAuthenticated && hasPermission("leave.read"),
    placeholderData: (prev) => prev,
  });
}

export function useLeaveQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.detail(id ?? ""),
    queryFn: () => leaveService.getById(id!),
    enabled: isAuthenticated && hasPermission("leave.read") && !!id,
  });
}

export function useEmployeeLeaveQuery(employeeProfileId?: string, params?: LeaveListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.byEmployee(employeeProfileId ?? "", params),
    queryFn: () => leaveService.listByEmployee(employeeProfileId!, params),
    enabled: isAuthenticated && hasPermission("leave.read") && !!employeeProfileId,
  });
}

export function useLeaveBalancesQuery(userId?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.balances(userId),
    queryFn: () => leaveService.getBalances(userId),
    enabled: isAuthenticated && hasPermission("leave.balance.read"),
  });
}

export function useLeaveLedgerQuery(params?: { page?: number; limit?: number; leaveTypeCode?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.ledger(params),
    queryFn: () => leaveService.getLedger(params),
    enabled: isAuthenticated && hasPermission("leave.balance.read"),
    placeholderData: (prev) => prev,
  });
}

export function useLeaveCalendarQuery(year: number, month: number, scope?: "self" | "team") {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.calendar(year, month, scope),
    queryFn: () => leaveService.getCalendar(year, month, scope),
    enabled: isAuthenticated && hasPermission("leave.calendar.read"),
  });
}

export function useLeaveMonthlySummaryQuery(year: number, month: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.monthlySummary(year, month),
    queryFn: () => leaveService.getMonthlySummary(year, month),
    enabled: isAuthenticated && hasPermission("leave.read"),
  });
}

export function useLeaveReportQuery(type: LeaveReportType, params?: LeaveReportParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.leave.report(type, params),
    queryFn: () => leaveService.getReport(type, params),
    enabled: isAuthenticated && hasPermission("leave.report"),
  });
}
