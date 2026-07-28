"use client";

import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthCalendarGrid } from "@/components/calendar/month-calendar-grid";
import { MonthCalendarNav } from "@/components/calendar/month-calendar-nav";
import { useMonthCalendarState } from "@/hooks/use-month-calendar-state";
import { useLeaveMonthEvents } from "@/hooks/use-leave-month-events";
import { useSelfMonthCalendarEvents } from "@/hooks/use-self-month-calendar-events";
import { useRegularizationDialogStore } from "@/store/regularization-dialog-store";
import { useCompOffDialogStore } from "@/store/comp-off-dialog-store";
import { useApplyLeaveDialogStore } from "@/store/apply-leave-dialog-store";
import { getErrorMessage } from "@/services/api/error-handler";
import type { LeaveScope } from "@/types/leave";
import { usePermissions } from "@/hooks/use-permissions";

export function LeaveCalendar({
  compact = false,
  scope = "self",
  showRegularization = true,
}: {
  compact?: boolean;
  scope?: LeaveScope;
  /** When scope is self, overlay attendance + regularization like Attendance Overview. */
  showRegularization?: boolean;
}) {
  const { year, month, prevMonth, nextMonth } = useMonthCalendarState();
  const { hasPermission } = usePermissions();
  const openRegularize = useRegularizationDialogStore((s) => s.openForDate);
  const openCompOff = useCompOffDialogStore((s) => s.openForDate);
  const openApplyLeave = useApplyLeaveDialogStore((s) => s.openForDate);

  const leaveOnly = useLeaveMonthEvents(year, month, scope);
  const selfMonth = useSelfMonthCalendarEvents(year, month);

  const useShared = scope === "self" && showRegularization;
  const eventMap = useShared ? selfMonth.eventMap : leaveOnly.eventMap;
  const punchMap = useShared ? selfMonth.punchMap : undefined;
  const isLoading = useShared ? selfMonth.isLoading : leaveOnly.isLoading;
  const isError = useShared ? selfMonth.isError : leaveOnly.isError;
  const error = useShared ? selfMonth.error : leaveOnly.error;
  const hasEvents = useShared ? selfMonth.hasEvents : leaveOnly.hasEvents;

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

      <MonthCalendarGrid
        year={year}
        month={month}
        eventMap={eventMap}
        punchMap={punchMap}
        compact={compact}
        onRegularizeDate={useShared ? openRegularize : undefined}
        onCompOffDate={hasPermission("comp_off.create") ? openCompOff : undefined}
        onApplyLeaveDate={hasPermission("leave.create") ? openApplyLeave : undefined}
      />

      {!compact && !hasEvents && (
        <EmptyState
          icon={Calendar}
          title="No leave events"
          description="No leave data for this month."
        />
      )}
    </div>
  );
}
