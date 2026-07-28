"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { ApprovalsPage } from "@/features/approvals/approvals-page";

export default function ApprovalsRoutePage() {
  return (
    <PermissionGuard
      permissions={["leave.approve", "workflow.instance.approve", "regularization.approve"]}
    >
      <ApprovalsPage />
    </PermissionGuard>
  );
}
