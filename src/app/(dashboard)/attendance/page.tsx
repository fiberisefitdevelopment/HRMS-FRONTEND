"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { AttendancePage } from "@/features/attendance/attendance-page";

export default function AttendanceRoutePage() {
  return (
    <PermissionGuard permissions={["attendance.view", "attendance.punch", "attendance.dashboard"]}>
      <AttendancePage />
    </PermissionGuard>
  );
}
