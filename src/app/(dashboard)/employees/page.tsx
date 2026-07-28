"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { EmployeesPage } from "@/features/employees/employees-page";
import { usePermissions } from "@/hooks/use-permissions";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import { PageLoader } from "@/components/feedback/loading-spinner";

function EmployeesRouteContent() {
  const router = useRouter();
  const { hasRole, hasPermission } = usePermissions();
  const { data: me, isLoading } = useEmployeeMeQuery();

  useEffect(() => {
    if (hasRole("employee") && !hasPermission("employee.read") && me?.id) {
      router.replace(`/employees/${me.id}`);
    }
  }, [hasRole, hasPermission, me?.id, router]);

  if (hasRole("employee") && !hasPermission("employee.read")) {
    if (isLoading) return <PageLoader />;
    return null;
  }

  return <EmployeesPage />;
}

export default function EmployeesRoutePage() {
  return (
    <PermissionGuard permissions={["employee.read"]}>
      <EmployeesRouteContent />
    </PermissionGuard>
  );
}
