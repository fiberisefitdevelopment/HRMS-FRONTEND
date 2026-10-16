"use client";

import { useQuery } from "@tanstack/react-query";
import { employeesService } from "@/services/employees/employees.service";
import { attendanceService } from "@/services/attendance/attendance.service";
import { leaveService } from "@/services/leave/leave.service";
import { workflowService } from "@/services/workflow/workflow.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { EmployeeListParams, ManagerOption } from "@/types/employee";

export function useEmployeesQuery(params?: EmployeeListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.employee.all(params),
    queryFn: () => employeesService.list(params),
    enabled: isAuthenticated && hasPermission("employee.read"),
    placeholderData: (prev) => prev,
  });
}

export function useDeletedEmployeesQuery(params?: EmployeeListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.employee.deleted(params),
    queryFn: () => employeesService.listDeleted(params),
    enabled: isAuthenticated && hasPermission("employee.delete"),
    placeholderData: (prev) => prev,
  });
}

export function useEmployeeQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission, hasRole } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.employee.detail(id ?? ""),
    queryFn: () => employeesService.getById(id!),
    enabled:
      isAuthenticated && !!id && (hasPermission("employee.read") || hasRole("employee")),
  });
}

export function useEmployeeMeQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.employee.me,
    queryFn: () => employeesService.getMe(),
    enabled: isAuthenticated,
  });
}

export function useManagerOptionsQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.employee.managers,
    queryFn: async (): Promise<ManagerOption[]> => {
      const { data } = await employeesService.list({ limit: 100, sort: "firstName" });
      const map = new Map<string, ManagerOption>();

      data.forEach((employee) => {
        // managerId on profiles refs User — always send userId, never profile id
        const userId = String(employee.userId ?? "");
        if (!userId) return;

        map.set(userId, {
          id: userId,
          userId,
          label: `${employee.fullName} (${employee.employeeId})`,
          email: employee.email,
        });
      });

      return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    },
    enabled: isAuthenticated && hasPermission("employee.read"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmployeeAttendanceQuery(employeeProfileId?: string, page = 1) {
  const { hasPermission } = usePermissions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.attendance.byEmployee(employeeProfileId ?? "", { page }),
    queryFn: () => attendanceService.listByEmployee(employeeProfileId!, { page, limit: 10 }),
    enabled: isAuthenticated && !!employeeProfileId && hasPermission("attendance.view"),
  });
}

export function useEmployeeLeaveQuery(employeeProfileId?: string, page = 1) {
  const { hasPermission } = usePermissions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.leave.byEmployee(employeeProfileId ?? "", { page }),
    queryFn: () => leaveService.listByEmployee(employeeProfileId!, { page, limit: 10 }),
    enabled: isAuthenticated && !!employeeProfileId && hasPermission("leave.read"),
  });
}

export function useEmployeeWorkflowQuery(userId?: string, page = 1) {
  const { hasPermission } = usePermissions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.workflow.byEmployee(userId ?? "", { page }),
    queryFn: () => workflowService.listByEmployee(userId!, { page, limit: 10 }),
    enabled:
      isAuthenticated && !!userId && hasPermission("workflow.instance.read"),
  });
}
