"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
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
import { useManagerAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import { formatMinutes, formatPunchTime, getEmployeeDisplayName } from "@/lib/attendance/format";
import { getErrorMessage } from "@/services/api/error-handler";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TeamAttendanceTodayCard() {
  const { data, isLoading, isError, error } = useManagerAttendanceDashboardQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
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
          <EmptyState icon={Clock} title="No attendance data" description="Unable to load team attendance." />
        </CardContent>
      </Card>
    );
  }

  const { summary, records } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Team Attendance Today
        </CardTitle>
        <Link href="/attendance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Full view
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatPill label="Present" value={summary.present} tone="emerald" />
          <StatPill label="Absent" value={summary.absent} tone="rose" />
          <StatPill label="Late" value={summary.late} tone="amber" />
          <StatPill label="Half day" value={summary.half_day} tone="amber" />
          <StatPill label="Pending out" value={summary.pendingPunchOut ?? 0} tone="slate" />
          <StatPill label="Team size" value={summary.total} tone="blue" />
        </div>

        {!records.length ? (
          <EmptyState title="No punch records yet" description="Team attendance will appear here through the day." className="py-6" />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>In</TableHead>
                  <TableHead>Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{getEmployeeDisplayName(record)}</TableCell>
                    <TableCell className="tabular-nums">{formatPunchTime(record.punchIn)}</TableCell>
                    <TableCell className="tabular-nums">{formatPunchTime(record.punchOut)}</TableCell>
                    <TableCell className="tabular-nums">{formatMinutes(record.netWorkingMinutes)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={record.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "amber" | "blue" | "slate";
}) {
  const toneClass = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    slate: "text-muted-foreground",
  }[tone];

  return (
    <div className="rounded-lg border bg-muted/20 px-2.5 py-2 text-center">
      <p className={cn("text-lg font-bold tabular-nums", toneClass)}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
