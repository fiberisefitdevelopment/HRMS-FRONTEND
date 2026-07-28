"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { OrganizationPage } from "@/features/organization/organization-page";

export default function OrganizationRoutePage() {
  return (
    <PermissionGuard permissions={["company.read", "department.read", "designation.read"]}>
      <OrganizationPage />
    </PermissionGuard>
  );
}
