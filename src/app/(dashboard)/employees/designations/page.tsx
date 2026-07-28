"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { DesignationsPage } from "@/features/organization/designations/designations-page";

export default function DesignationsRoutePage() {
  return (
    <PermissionGuard permissions={["designation.read"]}>
      <DesignationsPage />
    </PermissionGuard>
  );
}
