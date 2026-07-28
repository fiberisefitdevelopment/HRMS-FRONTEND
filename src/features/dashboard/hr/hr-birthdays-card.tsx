"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Cake } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { getBirthdaysToday } from "@/lib/employee/dashboard-helpers";

export function HrBirthdaysCard({ limit = 20 }: { limit?: number }) {
  const { data, isLoading } = useEmployeesQuery({
    status: "active",
    limit: 500,
    sort: "firstName",
  });

  const birthdays = useMemo(() => {
    return getBirthdaysToday(data?.data ?? []).slice(0, limit);
  }, [data?.data, limit]);

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="shrink-0 pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-4 w-4 text-muted-foreground" />
          Today&apos;s Birthdays
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {!birthdays.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">No birthdays today.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {birthdays.map((employee) => (
              <li key={employee.id}>
                <Link
                  href={`/employees/${employee.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{employee.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.department?.name ?? employee.designation?.name ?? employee.employeeId}
                    </p>
                  </div>
                  {employee.dateOfBirth && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format(new Date(employee.dateOfBirth), "dd MMM")}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
