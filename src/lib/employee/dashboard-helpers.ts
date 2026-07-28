import type { AttendanceRecord } from "@/types/attendance";
import type { Employee } from "@/types/employee";

const LEAVE_STATUSES = new Set(["leave", "on_leave", "holiday", "week_off"]);

export function isSameMonthDay(dateStr: string, reference = new Date()): boolean {
  const date = new Date(dateStr);
  return date.getMonth() === reference.getMonth() && date.getDate() === reference.getDate();
}

export function isRecentJoiner(joiningDate: string, withinDays = 30, reference = new Date()): boolean {
  const joined = new Date(joiningDate);
  const cutoff = new Date(reference);
  cutoff.setDate(cutoff.getDate() - withinDays);
  return joined >= cutoff;
}

export function getBirthdaysToday(employees: Employee[], reference = new Date()): Employee[] {
  return employees.filter(
    (employee) => employee.dateOfBirth && isSameMonthDay(employee.dateOfBirth, reference)
  );
}

export function getRecentJoiners(employees: Employee[], withinDays = 30): Employee[] {
  return employees
    .filter((employee) => employee.joiningDate && isRecentJoiner(employee.joiningDate, withinDays))
    .sort(
      (a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
    );
}

export function getEmployeesOnLeaveToday(records: AttendanceRecord[]): AttendanceRecord[] {
  return records.filter((record) => LEAVE_STATUSES.has(record.attendanceStatus));
}

export function getYetToPunchEmployees(
  employees: Employee[],
  records: AttendanceRecord[]
): Employee[] {
  const recordByUserId = new Map(records.map((record) => [record.userId, record]));

  return employees.filter((employee) => {
    const record = recordByUserId.get(employee.userId);
    if (!record) return true;
    if (LEAVE_STATUSES.has(record.attendanceStatus)) return false;
    return !record.punchIn?.timestamp;
  });
}
