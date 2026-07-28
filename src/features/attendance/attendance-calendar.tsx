"use client";

import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthCalendarGrid } from "@/components/calendar/month-calendar-grid";
import { MonthCalendarNav } from "@/components/calendar/month-calendar-nav";
import { useMonthCalendarState } from "@/hooks/use-month-calendar-state";
import { useSelfMonthCalendarEvents } from "@/hooks/use-self-month-calendar-events";
import { useRegularizationDialogStore } from "@/store/regularization-dialog-store";
import { useCompOffDialogStore } from "@/store/comp-off-dialog-store";
import { useApplyLeaveDialogStore } from "@/store/apply-leave-dialog-store";
import { formatMinutes } from "@/lib/attendance/format";
import { getErrorMessage } from "@/services/api/error-handler";
import { usePermissions } from "@/hooks/use-permissions";

export function AttendanceCalendar({ compact = false }: { compact?: boolean }) {
  const { year, month, prevMonth, nextMonth } = useMonthCalendarState();
  const { hasPermission } = usePermissions();
  const openRegularize = useRegularizationDialogStore((s) => s.openForDate);
  const openCompOff = useCompOffDialogStore((s) => s.openForDate);
  const openApplyLeave = useApplyLeaveDialogStore((s) => s.openForDate);
  const { eventMap, punchMap, attendanceData, isLoading, isError, error, hasEvents } =
    useSelfMonthCalendarEvents(year, month);

  if (isLoading) return <Skeleton className={compact ? "h-72" : "h-96"} />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <MonthCalendarNav
        year={year}
        month={month}
        onPrev={prevMonth}
        onNext={nextMonth}
        compact={compact}
      />

      {attendanceData?.summary && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Present: {attendanceData.summary.present}</span>
          <span>Late: {attendanceData.summary.late}</span>
          <span>Absent: {attendanceData.summary.absent}</span>
          <span>Total net: {formatMinutes(attendanceData.totalNetMinutes)}</span>
        </div>
      )}

      <MonthCalendarGrid
        year={year}
        month={month}
        eventMap={eventMap}
        punchMap={punchMap}
        compact={compact}
        onRegularizeDate={openRegularize}
        onCompOffDate={hasPermission("comp_off.create") ? openCompOff : undefined}
        onApplyLeaveDate={hasPermission("leave.create") ? openApplyLeave : undefined}
      />

      {!compact && !hasEvents && (
        <EmptyState
          icon={Calendar}
          title="No events this month"
          description="No attendance or leave data for this month."
        />
      )}
    </div>
  );
}
