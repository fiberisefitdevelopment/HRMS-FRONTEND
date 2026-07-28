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
import { Users } from "lucide-react";
import { useManagerAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { getErrorMessage } from "@/services/api/error-handler";
import { AttendanceStatusBadge } from "../attendance-status-badge";
import { formatMinutes, formatPunchTime, getEmployeeDisplayName } from "@/lib/attendance/format";

export function ManagerAttendanceDashboard() {
  const { data, isLoading, isError, error } = useManagerAttendanceDashboardQuery();

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
    return <EmptyState icon={Users} title="No team attendance data" />;
  }

  const { summary, records } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Present" value={summary.present} />
        <StatCard title="Absent" value={summary.absent} />
        <StatCard title="Late" value={summary.late} />
        <StatCard title="Half Day" value={summary.half_day} />
        <StatCard title="Pending Punch Out" value={summary.pendingPunchOut ?? 0} />
        <StatCard title="Team Total" value={summary.total} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Attendance Today</CardTitle>
        </CardHeader>
        <CardContent>
          {!records.length ? (
            <EmptyState title="No team records today" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Punch In</TableHead>
                  <TableHead>Punch Out</TableHead>
                  <TableHead>Net Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{getEmployeeDisplayName(r)}</TableCell>
                    <TableCell>{formatPunchTime(r.punchIn)}</TableCell>
                    <TableCell>{formatPunchTime(r.punchOut)}</TableCell>
                    <TableCell>{formatMinutes(r.netWorkingMinutes)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={r.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
