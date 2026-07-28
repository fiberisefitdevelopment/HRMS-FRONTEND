"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { LeaveStatusBadge } from "@/features/leave/leave-status-badge";
import { formatLeaveDate, formatLeaveDays } from "@/lib/leave/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RecentLeaveRequestsCard({ limit = 5 }: { limit?: number }) {
  const { data, isLoading } = useLeaveListQuery({ limit, sort: "-createdAt" });
  const items = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
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
          <FileText className="h-4 w-4 text-muted-foreground" />
          Recent Leave Requests
        </CardTitle>
        <Link href="/leave" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <EmptyState
            icon={FileText}
            title="No leave requests"
            description="Your leave applications will appear here."
            className="py-6"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((leave) => (
              <li
                key={leave.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {leave.leaveTypeCode ?? leave.leaveType} · {formatLeaveDays(leave.totalDays)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatLeaveDate(leave.startDate)} – {formatLeaveDate(leave.endDate)}
                  </p>
                </div>
                <LeaveStatusBadge status={leave.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
