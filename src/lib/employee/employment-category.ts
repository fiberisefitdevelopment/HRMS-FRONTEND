import type { Employee, EmploymentCategory, EmploymentType } from "@/types/employee";

export function getEmploymentCategory(
  employmentType?: EmploymentType | null
): EmploymentCategory {
  return employmentType === "contract" ? "contractual" : "permanent";
}

export function getEmploymentCategoryLabel(
  employmentType?: EmploymentType | null
): string {
  return getEmploymentCategory(employmentType) === "contractual"
    ? "Contractual"
    : "Permanent";
}

export function getEmployeeCategoryLabel(employee: Pick<Employee, "employmentType">): string {
  return getEmploymentCategoryLabel(employee.employmentType);
}
