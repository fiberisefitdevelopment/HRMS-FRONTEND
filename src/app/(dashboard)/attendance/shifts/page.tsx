"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { ShiftsPage } from "@/features/attendance/shifts/shifts-page";

export default function ShiftsRoutePage() {
  return (
    <PermissionGuard permissions={["attendance.shift.manage"]}>
      <ShiftsPage />
    </PermissionGuard>
  );
}
