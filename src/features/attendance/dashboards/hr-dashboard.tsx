"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import { useHrAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { getErrorMessage } from "@/services/api/error-handler";
import { AttendanceStatusBadge } from "../attendance-status-badge";
import { formatMinutes, formatPunchTime, getEmployeeDisplayName } from "@/lib/attendance/format";

export function HrAttendanceDashboard() {
  const { data, isLoading, isError, error } = useHrAttendanceDashboardQuery();

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <EmptyState icon={Building2} title="No HR dashboard data" />;
  }

  const { summary, lateEmployees, missingPunch } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard title="Present" value={summary.present} />
        <StatCard title="Absent" value={summary.absent} />
        <StatCard title="Late" value={summary.late} />
        <StatCard title="Half Day" value={summary.half_day} />
        <StatCard title="Regularized" value={summary.regularized ?? 0} />
        <StatCard title="Missing Punch" value={summary.missingPunch ?? 0} />
        <StatCard title="Total" value={summary.total} />
      </div>

      {lateEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Late Employees Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Punch In</TableHead>
                  <TableHead>Late By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lateEmployees.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{getEmployeeDisplayName(r)}</TableCell>
                    <TableCell>{formatPunchTime(r.punchIn)}</TableCell>
                    <TableCell>{formatMinutes(r.lateByMinutes)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={r.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {missingPunch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Punch Out</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Punch In</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingPunch.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{getEmployeeDisplayName(r)}</TableCell>
                    <TableCell>{formatPunchTime(r.punchIn)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={r.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
