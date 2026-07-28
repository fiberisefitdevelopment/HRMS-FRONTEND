"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { CompOffPage } from "@/features/comp-off/comp-off-page";

export default function CompOffRoutePage() {
  return (
    <PermissionGuard permissions={["comp_off.read", "comp_off.create"]}>
      <div className="space-y-6">
        <PageHeader
          title="Comp-off"
          description="Raise compensatory off for overtime after shift end, then use COMP_OFF balance via Apply Leave"
        />
        <CompOffPage />
      </div>
    </PermissionGuard>
  );
}
