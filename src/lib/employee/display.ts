import { WEEKDAYS } from "@/lib/date/month-calendar";
import type { Employee, EmploymentType } from "@/types/employee";

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  intern: "Intern",
  probation: "Probation",
};

export function getEmployeeDepartmentName(employee: Employee): string | undefined {
  return employee.departmentName ?? employee.department?.name ?? undefined;
}

export function getEmployeeDesignationName(employee: Employee): string | undefined {
  return employee.designationName ?? employee.designation?.name ?? undefined;
}

export function getEmployeeManagerName(employee: Employee): string | undefined {
  return employee.managerName ?? employee.manager?.fullName ?? undefined;
}

export function getEmployeeCompanyName(employee: Employee): string | undefined {
  return employee.company?.name ?? employee.company?.companyName ?? undefined;
}

export function formatEmploymentType(type?: EmploymentType | null): string | undefined {
  if (!type) return undefined;
  return EMPLOYMENT_TYPE_LABELS[type] ?? type.replaceAll("_", " ");
}

export function formatWorkingDays(days?: number[] | null): string | undefined {
  if (!days?.length) return undefined;
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS[day] ?? String(day))
    .join(", ");
}

export function getEmergencyContact(employee: Employee) {
  return {
    name: employee.emergencyContact?.name ?? employee.emergencyContactName ?? null,
    number: employee.emergencyContact?.number ?? employee.emergencyContactNumber ?? null,
    relation: employee.emergencyContact?.relation ?? employee.relation ?? null,
  };
}

export function getEmployeeDateOfBirth(employee: Employee): string | null | undefined {
  return employee.dateOfBirth ?? employee.dob;
}
