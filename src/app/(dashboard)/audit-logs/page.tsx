"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { AuditLogsPage } from "@/features/audit/audit-logs-page";
import { usePermissions } from "@/hooks/use-permissions";

function useAuditDescription() {
  const { hasRole } = usePermissions();
  if (hasRole(["hr", "owner"])) {
    return "Every action performed by users in your company";
  }
  if (hasRole(["manager"])) {
    return "Your actions, your team's activity, and approvals you give or receive";
  }
  return "Your activity and approvals from your manager, HR, or owner";
}

export default function AuditLogsRoutePage() {
  const description = useAuditDescription();

  return (
    <PermissionGuard permissions={["audit.read"]}>
      <div className="space-y-6">
        <PageHeader title="Audit Logs" description={description} />
        <AuditLogsPage />
      </div>
    </PermissionGuard>
  );
}
