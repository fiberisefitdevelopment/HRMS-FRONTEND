"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { AttendanceReportsPage } from "@/features/attendance/reports/attendance-reports-page";

export default function AttendanceReportsRoutePage() {
  return (
    <PermissionGuard permissions={["attendance.report"]}>
      <AttendanceReportsPage />
    </PermissionGuard>
  );
}
