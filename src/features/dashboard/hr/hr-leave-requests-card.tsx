"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { LeaveStatusBadge } from "@/features/leave/leave-status-badge";
import { formatLeaveDate, getEmployeeDisplayName } from "@/lib/leave/format";
import { toLocalDateKey } from "@/lib/date/calendar";

export function HrLeaveRequestsCard({ limit = 5 }: { limit?: number }) {
  const today = toLocalDateKey(new Date());
  const { data, isLoading } = useLeaveListQuery({
    status: "pending",
    limit: 50,
    sort: "-createdAt",
  });

  const urgent = useMemo(() => {
    return (data?.data ?? [])
      .filter((leave) => leave.startDate <= today)
      .slice(0, limit);
  }, [data?.data, limit, today]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Leave Requests
          {(data?.meta.total ?? 0) > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({data?.meta.total} pending)
            </span>
          )}
        </CardTitle>
        <Link href="/leave" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Leave hub
        </Link>
      </CardHeader>
      <CardContent>
        {!urgent.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No urgent leave requests today.</p>
        ) : (
          <ul className="space-y-2">
            {urgent.map((leave) => (
              <li
                key={leave.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{getEmployeeDisplayName(leave)}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.leaveTypeCode ?? leave.leaveType} · starts {formatLeaveDate(leave.startDate)}
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
