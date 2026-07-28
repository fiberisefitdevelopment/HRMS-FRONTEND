"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { HrAddLeaveForm } from "@/features/leave/hr-add-leave-form";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";

function HrAddLeavePageContent() {
  const { hasRole } = usePermissions();
  const router = useRouter();
  const isHrOrOwner = hasRole(["hr", "owner"]);

  useEffect(() => {
    if (!isHrOrOwner) {
      router.replace(ROUTES.forbidden);
    }
  }, [isHrOrOwner, router]);

  if (!isHrOrOwner) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Leave Balance"
        description="Credit leave days to employee balances. This increases balance — it does not apply or deduct leave."
      />
      <HrAddLeaveForm />
    </div>
  );
}

export default function LeaveAddRoutePage() {
  return (
    <PermissionGuard permissions={["leave.policy.manage"]} requireAll>
      <HrAddLeavePageContent />
    </PermissionGuard>
  );
}
