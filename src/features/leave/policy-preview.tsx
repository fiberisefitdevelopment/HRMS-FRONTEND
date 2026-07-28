"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeaveTypeConfig } from "@/types/leave-policy";
import type { LeaveBalance } from "@/types/leave";
import { formatCreditCycle } from "@/lib/leave/format";

interface PolicyPreviewProps {
  leaveType?: LeaveTypeConfig | null;
  balance?: LeaveBalance | null;
}

export function PolicyPreview({ leaveType, balance }: PolicyPreviewProps) {
  if (!leaveType) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Select a leave type to view policy rules from the backend.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Policy & Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Available balance</span>
          <span className="font-medium">{balance?.balance ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Credit cycle</span>
          <span>{formatCreditCycle(leaveType.creditCycle)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Credit amount</span>
          <span>{leaveType.creditAmount ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Max balance</span>
          <span>{leaveType.maxBalance ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {leaveType.carryForward && <Badge variant="secondary">Carry forward</Badge>}
          {leaveType.requiresAttachment && <Badge variant="secondary">Attachment required</Badge>}
          {leaveType.allowNegativeBalance && <Badge variant="secondary">Negative balance allowed</Badge>}
          {!leaveType.isActive && <Badge variant="destructive">Inactive</Badge>}
        </div>
        {leaveType.approvalFlow?.length ? (
          <div>
            <p className="mb-1 text-muted-foreground">Approval flow</p>
            <p className="capitalize">{leaveType.approvalFlow.join(" → ")}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
