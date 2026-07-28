"use client";

import { Suspense, use } from "react";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { EmployeeProfileView } from "@/features/employees/employee-profile-view";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <PermissionGuard permissions={["employee.read"]}>
      <Suspense fallback={<PageLoader />}>
        <EmployeeProfileView employeeId={id} />
      </Suspense>
    </PermissionGuard>
  );
}
