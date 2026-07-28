"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList } from "lucide-react";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { LeaveStatusBadge } from "./leave-status-badge";
import { formatLeaveDate, formatLeaveDays, getEmployeeDisplayName } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { LeaveRequest } from "@/types/leave";

type QueueMode = "pending" | "approved";

interface LeaveApprovalQueueProps {
  onReview: (leave: LeaveRequest) => void;
  mode?: QueueMode;
}

export function LeaveApprovalQueue({ onReview, mode = "pending" }: LeaveApprovalQueueProps) {
  const isApproved = mode === "approved";
  const { data: leaves, isLoading, isError, error } = useLeaveListQuery({
    status: isApproved ? "approved" : "pending",
    limit: 100,
    sort: "-createdAt",
  });

  const queue = (leaves?.data ?? []).filter((leave) =>
    isApproved ? leave.status === "approved" : leave.status === "pending"
  );

  if (isLoading) return <Skeleton className="h-48" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!queue.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={isApproved ? "No approved leave" : "No pending approvals"}
        description={
          isApproved
            ? "Approved leave requests will appear here."
            : "Leave requests waiting for your approval will appear here."
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isApproved ? "Approved Leave" : "Pending Approvals"} ({queue.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queue.map((leave) => (
          <div
            key={leave.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{getEmployeeDisplayName(leave)}</p>
              <p className="text-sm text-muted-foreground">
                {leave.leaveTypeCode ?? leave.leaveType} · {formatLeaveDate(leave.startDate)} –{" "}
                {formatLeaveDate(leave.endDate)} · {formatLeaveDays(leave.totalDays)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <LeaveStatusBadge status={leave.status} />
                {leave.currentApprovalStage && (
                  <span className="text-xs text-muted-foreground capitalize">
                    Stage: {leave.currentApprovalStage}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant={isApproved ? "outline" : "default"} onClick={() => onReview(leave)}>
              {isApproved ? "View" : "Review & Approve"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
