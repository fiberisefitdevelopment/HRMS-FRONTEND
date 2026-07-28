"use client";

import { useMemo } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { getRecentJoiners } from "@/lib/employee/dashboard-helpers";

export function HrNewJoinersCard({ limit = 20, withinDays = 30 }: { limit?: number; withinDays?: number }) {
  const { data, isLoading } = useEmployeesQuery({
    status: "active",
    limit: 500,
    sort: "-joiningDate",
  });

  const joiners = useMemo(
    () => getRecentJoiners(data?.data ?? [], withinDays).slice(0, limit),
    [data?.data, limit, withinDays]
  );

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="shrink-0 pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          New Joiners
          <span className="text-xs font-normal text-muted-foreground">({withinDays}d)</span>
        </CardTitle>
        <Link href="/employees" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Directory
        </Link>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {!joiners.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              No new joiners in the last {withinDays} days.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {joiners.map((employee) => (
              <li key={employee.id}>
                <Link
                  href={`/employees/${employee.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{employee.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.designation?.name ?? employee.employeeId}
                      {employee.department?.name ? ` · ${employee.department.name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(new Date(employee.joiningDate), "dd MMM")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
