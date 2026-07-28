"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { DepartmentsPage } from "@/features/organization/departments/departments-page";

export default function DepartmentsRoutePage() {
  return (
    <PermissionGuard permissions={["department.read"]}>
      <DepartmentsPage />
    </PermissionGuard>
  );
}
