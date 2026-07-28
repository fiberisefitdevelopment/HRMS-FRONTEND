import { Badge } from "@/components/ui/badge";
import { resolveAttendanceDisplayStatus } from "@/lib/attendance/format";
import type { AttendanceStatus } from "@/types/attendance";

const config: Record<
  AttendanceStatus,
  { label: string; variant: "success" | "secondary" | "warning" | "destructive" | "outline" | "info" }
> = {
  present: { label: "Present", variant: "success" },
  late: { label: "Late", variant: "warning" },
  regularized: { label: "Regularized", variant: "info" },
  half_day: { label: "Half Day", variant: "warning" },
  absent: { label: "Absent", variant: "destructive" },
  holiday: { label: "Holiday", variant: "secondary" },
  week_off: { label: "Week Off", variant: "secondary" },
  leave: { label: "Leave", variant: "outline" },
  missing_punch: { label: "Missing Punch", variant: "destructive" },
  auto_punch_out: { label: "Auto Punch Out", variant: "outline" },
  on_leave: { label: "On Leave", variant: "outline" },
};

export function AttendanceStatusBadge({
  status,
  lateByMinutes,
  isRegularized,
}: {
  status: AttendanceStatus | string;
  lateByMinutes?: number | null;
  isRegularized?: boolean | null;
}) {
  const resolved = resolveAttendanceDisplayStatus({
    attendanceStatus: status,
    lateByMinutes,
    isRegularized,
  }) as AttendanceStatus;
  const entry = config[resolved];
  return (
    <Badge variant={entry?.variant ?? "secondary"}>
      {entry?.label ?? String(resolved).replace(/_/g, " ")}
    </Badge>
  );
}
