"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { CompaniesPage } from "@/features/organization/companies/companies-page";

export default function CompaniesRoutePage() {
  return (
    <PermissionGuard permissions={["company.read"]}>
      <CompaniesPage />
    </PermissionGuard>
  );
}
