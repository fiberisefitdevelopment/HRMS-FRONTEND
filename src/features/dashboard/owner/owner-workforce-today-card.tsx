"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
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
import { useAuthStore } from "@/store/auth-store";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import {
  formatMinutes,
  formatPunchTime,
  getEmployeeDisplayName,
  resolveEmployeeProfileId,
} from "@/lib/attendance/format";
import { excludeOwnerFromAttendance } from "@/lib/employee/owner-dashboard-helpers";
import { getErrorMessage } from "@/services/api/error-handler";

export function OwnerWorkforceTodayCard({ limit = 8 }: { limit?: number }) {
  const ownerUserId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, isError, error } = useHrAttendanceDashboardQuery();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
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
          <EmptyState icon={Activity} title="No workforce data" />
        </CardContent>
      </Card>
    );
  }

  const records = excludeOwnerFromAttendance(data.records, ownerUserId);
  const visible = records.slice(0, limit);
  const atWork = records.filter((record) =>
    ["present", "late", "regularized"].includes(record.attendanceStatus)
  ).length;
  const onLeave = records.filter((record) =>
    ["leave", "on_leave", "holiday", "week_off"].includes(record.attendanceStatus)
  ).length;
  const late = records.filter((record) => record.attendanceStatus === "late").length;
  const missingPunch = records.filter((record) => record.attendanceStatus === "missing_punch").length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/20 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Who&apos;s in today
        </CardTitle>
        <Link href="/attendance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
          Full attendance
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <PulseStat label="At work" value={atWork} tone="emerald" />
          <PulseStat label="On leave" value={onLeave} tone="blue" />
          <PulseStat label="Late" value={late} tone="amber" />
          <PulseStat label="Missing punch" value={missingPunch} tone="rose" />
        </div>

        {!visible.length ? (
          <EmptyState
            title="No check-ins yet"
            description="Your team's attendance will show up here throughout the day."
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
                          <Link href={`/employees/${profileId}`} className="hover:underline">
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

function PulseStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "blue" | "amber" | "rose";
}) {
  const toneClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 text-center">
      <p className={cn("text-xl font-bold tabular-nums", toneClass)}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
