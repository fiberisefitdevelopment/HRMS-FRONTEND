"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { LeaveReportsPage } from "@/features/leave/reports/leave-reports-page";

export default function LeaveReportsRoutePage() {
  return (
    <PermissionGuard permissions={["leave.report"]}>
      <LeaveReportsPage />
    </PermissionGuard>
  );
}
