import type { AttendanceRecord } from "@/types/attendance";
import type { Employee } from "@/types/employee";
import {
  getBirthdaysToday,
  getEmployeesOnLeaveToday,
  getRecentJoiners,
  getYetToPunchEmployees,
} from "./dashboard-helpers";

export function excludeOwnerFromAttendance(
  records: AttendanceRecord[],
  ownerUserId?: string
): AttendanceRecord[] {
  if (!ownerUserId) return records;
  return records.filter((record) => String(record.userId) !== String(ownerUserId));
}

export function excludeOwnerFromEmployees(
  employees: Employee[],
  ownerUserId?: string
): Employee[] {
  if (!ownerUserId) return employees;
  return employees.filter((employee) => String(employee.userId) !== String(ownerUserId));
}

export function getDepartmentHeadcount(employees: Employee[]) {
  const counts = new Map<string, number>();

  for (const employee of employees) {
    const name = employee.department?.name ?? "Unassigned";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export interface OwnerWorkforceSummary {
  workforceTotal: number;
  atWork: number;
  onLeave: number;
  yetToPunch: number;
  late: number;
  absent: number;
  attendanceRate: number;
  birthdaysToday: number;
  newJoiners: number;
  records: AttendanceRecord[];
}

export function computeOwnerWorkforceSummary(
  employees: Employee[],
  records: AttendanceRecord[],
  ownerUserId?: string
): OwnerWorkforceSummary {
  const workforce = excludeOwnerFromEmployees(employees, ownerUserId);
  const attendance = excludeOwnerFromAttendance(records, ownerUserId);
  const onLeave = getEmployeesOnLeaveToday(attendance).length;
  const yetToPunch = getYetToPunchEmployees(workforce, attendance).length;
  const atWork = attendance.filter((record) =>
    ["present", "late", "regularized"].includes(record.attendanceStatus)
  ).length;
  const late = attendance.filter((record) => record.attendanceStatus === "late").length;
  const absent = attendance.filter((record) => record.attendanceStatus === "absent").length;
  const workforceTotal = workforce.length;
  const attendanceRate =
    workforceTotal > 0 ? Math.round((atWork / workforceTotal) * 100) : 0;

  return {
    workforceTotal,
    atWork,
    onLeave,
    yetToPunch,
    late,
    absent,
    attendanceRate,
    birthdaysToday: getBirthdaysToday(workforce).length,
    newJoiners: getRecentJoiners(workforce).length,
    records: attendance,
  };
}
