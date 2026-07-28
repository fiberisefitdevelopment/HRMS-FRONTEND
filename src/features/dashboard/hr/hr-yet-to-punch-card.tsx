"use client";

import { useMemo } from "react";
import Link from "next/link";
import { UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useHrAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { getYetToPunchEmployees } from "@/lib/employee/dashboard-helpers";

export function HrYetToPunchCard({ limit = 20 }: { limit?: number }) {
  const { data: employeesData, isLoading: empLoading } = useEmployeesQuery({
    status: "active",
    limit: 500,
    sort: "firstName",
  });
  const { data: attendanceData, isLoading: attLoading } = useHrAttendanceDashboardQuery();

  const yetToPunch = useMemo(() => {
    const employees = employeesData?.data ?? [];
    const records = attendanceData?.records ?? [];
    return getYetToPunchEmployees(employees, records).slice(0, limit);
  }, [attendanceData?.records, employeesData?.data, limit]);

  const isLoading = empLoading || attLoading;

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="shrink-0 pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <UserX className="h-4 w-4 text-muted-foreground" />
          Yet to punch in
          {yetToPunch.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({yetToPunch.length})</span>
          )}
        </CardTitle>
        <Link href="/attendance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Attendance
        </Link>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {!yetToPunch.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              Everyone expected to work has punched in.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {yetToPunch.map((employee) => (
              <li key={employee.id}>
                <Link
                  href={`/employees/${employee.id}?tab=attendance`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{employee.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.employeeId}
                      {employee.department?.name ? ` · ${employee.department.name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    Waiting
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
