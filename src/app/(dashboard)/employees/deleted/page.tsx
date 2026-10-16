"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { DeletedEmployeesPage } from "@/features/employees/deleted-employees-page";

export default function DeletedEmployeesRoutePage() {
  return (
    <PermissionGuard permissions={["employee.delete"]}>
      <DeletedEmployeesPage />
    </PermissionGuard>
  );
}
