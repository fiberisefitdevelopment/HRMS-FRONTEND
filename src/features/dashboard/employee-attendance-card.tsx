"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmployeeAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { AttendanceOverview } from "@/features/attendance/attendance-overview";
import { getErrorMessage } from "@/services/api/error-handler";

export function EmployeeAttendanceCard() {
  const { data, isLoading, isError, error } = useEmployeeAttendanceDashboardQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState icon={Clock} title="No attendance data" description="Unable to load today's attendance." />
        </CardContent>
      </Card>
    );
  }

  const { today, monthlySummary } = data;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Attendance</h2>
        <Link href="/attendance" className="text-xs text-primary hover:underline">
          Full view
        </Link>
      </div>
      <AttendanceOverview
        today={today}
        monthlySummary={monthlySummary}
        variant="compact"
        showSessions
      />
    </section>
  );
}
