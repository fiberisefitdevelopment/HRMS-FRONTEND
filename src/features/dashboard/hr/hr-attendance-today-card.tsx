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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHrAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import { formatMinutes, formatPunchTime, getEmployeeDisplayName, resolveEmployeeProfileId } from "@/lib/attendance/format";
import { getErrorMessage } from "@/services/api/error-handler";

export function HrAttendanceTodayCard({ limit = 8 }: { limit?: number }) {
  const { data, isLoading, isError, error } = useHrAttendanceDashboardQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
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
          <EmptyState icon={Clock} title="No attendance data" />
        </CardContent>
      </Card>
    );
  }

  const { summary, records } = data;
  const visible = records.slice(0, limit);
  const atWork = summary.present + summary.late + (summary.regularized ?? 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Today&apos;s Attendance
        </CardTitle>
        <Link href="/attendance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Full view
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <StatPill label="At work" value={atWork} tone="emerald" />
          <StatPill label="Present" value={summary.present} tone="emerald" />
          <StatPill label="Late" value={summary.late} tone="amber" />
          <StatPill label="Absent" value={summary.absent} tone="rose" />
          <StatPill label="On leave" value={records.filter((r) => r.attendanceStatus === "leave" || r.attendanceStatus === "on_leave").length} tone="blue" />
          <StatPill label="Missing punch" value={summary.missingPunch ?? 0} tone="slate" />
          <StatPill label="Records" value={summary.total} tone="slate" />
        </div>

        {!visible.length ? (
          <EmptyState
            title="No punch records yet"
            description="Attendance will populate as employees punch in."
            className="py-6"
          />
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
                {visible.map((record) => {
                  const profileId = resolveEmployeeProfileId(record);
                  return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {profileId ? (
                        <Link
                          href={`/employees/${profileId}`}
                          className="hover:underline"
                        >
                          {getEmployeeDisplayName(record)}
                        </Link>
                      ) : (
                        getEmployeeDisplayName(record)
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatPunchTime(record.punchIn)}</TableCell>
                    <TableCell className="tabular-nums">{formatPunchTime(record.punchOut)}</TableCell>
                    <TableCell className="tabular-nums">{formatMinutes(record.netWorkingMinutes)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={record.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                  );
                })}
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
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    slate: "text-muted-foreground",
  }[tone];

  return (
    <div className="rounded-lg border bg-muted/20 px-2.5 py-2 text-center">
      <p className={cn("text-lg font-bold tabular-nums", toneClass)}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
