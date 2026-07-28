"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { WfhPage } from "@/features/wfh/wfh-page";

export default function WfhRoutePage() {
  return (
    <PermissionGuard permissions={["wfh.read", "wfh.create"]}>
      <div className="space-y-6">
        <PageHeader
          title="Work From Home"
          description="Apply for WFH and review your past requests"
        />
        <WfhPage />
      </div>
    </PermissionGuard>
  );
}
