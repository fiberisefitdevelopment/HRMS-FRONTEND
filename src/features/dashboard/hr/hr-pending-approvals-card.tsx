"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { LeaveStatusBadge } from "@/features/leave/leave-status-badge";
import { formatLeaveDate, formatLeaveDays, getEmployeeDisplayName } from "@/lib/leave/format";
import type { LeaveRequest } from "@/types/leave";

interface HrPendingApprovalsCardProps {
  limit?: number;
  onReview?: (leave: LeaveRequest) => void;
}

export function HrPendingApprovalsCard({ limit = 5, onReview }: HrPendingApprovalsCardProps) {
  const { data: leaves, isLoading } = useLeaveListQuery({
    status: "pending",
    limit: 100,
    sort: "-createdAt",
  });

  const queue = useMemo(
    () => (leaves?.data ?? []).filter((leave) => leave.status === "pending"),
    [leaves]
  );

  const items = queue.slice(0, limit);

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          Pending Approvals
          {queue.length > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              {queue.length}
            </span>
          )}
        </CardTitle>
        <Link href="/approvals" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No pending approvals right now.</p>
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
                    {formatLeaveDate(leave.endDate)} · {formatLeaveDays(leave.totalDays)}
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
