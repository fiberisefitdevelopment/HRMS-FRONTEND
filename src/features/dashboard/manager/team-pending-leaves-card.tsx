"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { LeaveStatusBadge } from "@/features/leave/leave-status-badge";
import { formatLeaveDate, getEmployeeDisplayName } from "@/lib/leave/format";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types/leave";

export function TeamPendingLeavesCard({
  limit = 5,
  onReview,
  reviewAllHref = "/teams/leave",
}: {
  limit?: number;
  onReview?: (leave: LeaveRequest) => void;
  reviewAllHref?: string;
}) {
  const { data: teamLeaves, isLoading } = useLeaveListQuery({
    status: "pending",
    limit,
    sort: "-createdAt",
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = teamLeaves?.data ?? [];
  const approvalCount = teamLeaves?.meta.total ?? items.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          Pending Approvals
          {approvalCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              {approvalCount} action{approvalCount === 1 ? "" : "s"}
            </span>
          )}
        </CardTitle>
        <Link href={reviewAllHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No pending team leave requests.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((leave) => (
              <li
                key={leave.id}
                className="flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{getEmployeeDisplayName(leave)}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.leaveTypeCode ?? leave.leaveType} · {formatLeaveDate(leave.startDate)} –{" "}
                    {formatLeaveDate(leave.endDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <LeaveStatusBadge status={leave.status} />
                  {onReview && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => onReview(leave)}>
                      Review
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
