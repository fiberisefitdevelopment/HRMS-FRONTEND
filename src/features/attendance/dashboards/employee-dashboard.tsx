"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";
import { useEmployeeAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { getErrorMessage } from "@/services/api/error-handler";
import { AttendanceOverview } from "../attendance-overview";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmployeeAttendanceDashboard() {
  const { data, isLoading, isError, error } = useEmployeeAttendanceDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <EmptyState icon={Calendar} title="No dashboard data" description="Unable to load attendance dashboard." />;
  }

  const { today, monthlySummary } = data;

  return (
    <div className="space-y-6">
      <AttendanceOverview
        today={today}
        monthlySummary={monthlySummary}
        variant="full"
        showMonthly={false}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <StatCard title="Present" value={monthlySummary.present} />
            <StatCard title="Late" value={monthlySummary.late} />
            <StatCard title="Regularized" value={monthlySummary.regularized} />
            <StatCard title="Half Day" value={monthlySummary.half_day} />
            <StatCard title="Absent" value={monthlySummary.absent} />
            <StatCard title="Total Days" value={monthlySummary.total} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
