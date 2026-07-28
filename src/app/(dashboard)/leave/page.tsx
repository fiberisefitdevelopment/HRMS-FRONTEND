"use client";

import { Suspense } from "react";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { LeavePage } from "@/features/leave/leave-page";

export default function LeaveRoutePage() {
  return (
    <PermissionGuard permissions={["leave.read", "leave.create", "leave.balance.read"]}>
      <Suspense fallback={<PageLoader />}>
        <LeavePage />
      </Suspense>
    </PermissionGuard>
  );
}
