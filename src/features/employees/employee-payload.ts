import type { CreateEmployeeFormValues } from "@/lib/validations/organization";
import type { CreateEmployeePayload, UpdateEmployeePayload } from "@/types/employee";

function cleanFormValues<T extends Record<string, unknown>>(values: T): Partial<T> {
  const cleanedEntries = Object.entries(values)
    .map(([key, value]) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return [key, trimmed === "" ? undefined : trimmed] as const;
      }
      return [key, value] as const;
    })
    .filter(([, value]) => value !== undefined && value !== null);

  return Object.fromEntries(cleanedEntries) as Partial<T>;
}

export function toCreateEmployeePayload(values: CreateEmployeeFormValues): CreateEmployeePayload {
  const cleaned = cleanFormValues(values) as Partial<CreateEmployeePayload>;
  return {
    ...cleaned,
    roleSlug: cleaned.roleSlug ?? "employee",
    firstName: cleaned.firstName ?? values.firstName,
    officialEmail: cleaned.officialEmail ?? values.officialEmail,
    joiningDate: cleaned.joiningDate ?? values.joiningDate,
  };
}

export function toUpdateEmployeePayload(values: CreateEmployeeFormValues): UpdateEmployeePayload {
  const { roleSlug, ...rest } = values;
  void roleSlug;
  const cleaned = cleanFormValues(rest) as UpdateEmployeePayload;
  if (values.employeeId?.trim()) {
    cleaned.employeeId = values.employeeId.trim().toUpperCase();
  }
  if (!values.shiftId) {
    return { ...cleaned, shiftId: null };
  }
  return cleaned;
}
