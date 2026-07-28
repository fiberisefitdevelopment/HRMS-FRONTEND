"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  Package,
  ArrowLeftRight,
  Home,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveApprovalQueue } from "@/features/leave/leave-approval-queue";
import { CompOffApprovalQueue } from "@/features/comp-off/comp-off-approval-queue";
import { RegularizationApprovalQueue } from "@/features/regularization/regularization-approval-queue";
import { WfhApprovalQueue } from "@/features/wfh/wfh-approval-queue";
import { LeaveDetailDialog } from "@/features/leave/leave-detail-dialog";
import { usePermissions } from "@/hooks/use-permissions";
import type { LeaveRequest } from "@/types/leave";

const COMING_SOON = [
  { title: "Documents", icon: FileText },
  { title: "Expense Claims", icon: Receipt },
  { title: "Asset Requests", icon: Package },
  { title: "Transfer / Promotion", icon: ArrowLeftRight },
];

function ComingSoonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {COMING_SOON.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="border-dashed opacity-70">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ApprovalsPage() {
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const { hasPermission } = usePermissions();
  const canApproveLeave = hasPermission("leave.approve");
  const canApproveRegularization = hasPermission("regularization.approve");
  const canApproveCompOff = hasPermission("workflow.instance.approve");
  const canReadCompOff = hasPermission("comp_off.read");
  const canApproveWfh = hasPermission("wfh.approve");
  const canViewApproved =
    canApproveLeave ||
    canApproveCompOff ||
    canReadCompOff ||
    canApproveWfh ||
    canApproveRegularization;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Everything waiting on your action, in one place"
      />

      <Tabs defaultValue="all">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">Pending</TabsTrigger>
          {canViewApproved && (
            <TabsTrigger value="approved">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Approved
            </TabsTrigger>
          )}
          {canApproveLeave && (
            <TabsTrigger value="leave">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Leave
            </TabsTrigger>
          )}
          {canApproveCompOff && <TabsTrigger value="comp-off">Comp-off</TabsTrigger>}
          {canApproveWfh && (
            <TabsTrigger value="wfh">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Work From Home
            </TabsTrigger>
          )}
          {canApproveRegularization && (
            <TabsTrigger value="regularization">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Regularization
            </TabsTrigger>
          )}
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          {canApproveLeave && <LeaveApprovalQueue onReview={setSelected} />}
          {canApproveCompOff && <CompOffApprovalQueue />}
          {canApproveWfh && <WfhApprovalQueue />}
          {canApproveRegularization && <RegularizationApprovalQueue />}
        </TabsContent>

        {canViewApproved && (
          <TabsContent value="approved" className="mt-4 space-y-6">
            {canApproveLeave && (
              <LeaveApprovalQueue onReview={setSelected} mode="approved" />
            )}
            {(canApproveCompOff || canReadCompOff) && (
              <CompOffApprovalQueue mode="approved" />
            )}
            {canApproveWfh && <WfhApprovalQueue mode="approved" />}
            {canApproveRegularization && (
              <RegularizationApprovalQueue mode="approved" />
            )}
          </TabsContent>
        )}

        {canApproveLeave && (
          <TabsContent value="leave" className="mt-4">
            <LeaveApprovalQueue onReview={setSelected} />
          </TabsContent>
        )}

        {canApproveCompOff && (
          <TabsContent value="comp-off" className="mt-4">
            <CompOffApprovalQueue />
          </TabsContent>
        )}

        {canApproveWfh && (
          <TabsContent value="wfh" className="mt-4">
            <WfhApprovalQueue />
          </TabsContent>
        )}

        {canApproveRegularization && (
          <TabsContent value="regularization" className="mt-4">
            <RegularizationApprovalQueue />
          </TabsContent>
        )}

        <TabsContent value="other" className="mt-4">
          <ComingSoonGrid />
        </TabsContent>
      </Tabs>

      <LeaveDetailDialog
        leave={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        canApprove={canApproveLeave && selected?.status === "pending"}
      />
    </div>
  );
}
