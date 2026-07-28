"use client";

import { useMemo } from "react";
import { useLeaveMonthEvents } from "@/hooks/use-leave-month-events";
import {
  useAttendanceMonthlySummaryQuery,
  useAttendanceTodayQuery,
} from "@/hooks/queries/use-attendance-queries";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import {
  mergeRegularizationIntoEventMap,
  useRegularizationCalendarEvents,
} from "@/hooks/use-regularization-calendar-events";
import {
  mergeCompOffIntoEventMap,
  useCompOffCalendarEvents,
} from "@/hooks/use-comp-off-calendar-events";
import {
  buildAttendanceEventMap,
  buildAttendancePunchMap,
  mergeCalendarEventMaps,
  type CalendarEventMap,
} from "@/lib/calendar/calendar-events";
import { toLocalDateKey } from "@/lib/date/calendar";
import { usePermissions } from "@/hooks/use-permissions";
import type { AttendanceRecord } from "@/types/attendance";

/**
 * Shared month events for self calendars (dashboard Leave Calendar + Attendance Overview).
 * Keep both views on the same leave + attendance + regularization + comp-off overlay.
 */
export function useSelfMonthCalendarEvents(year: number, month: number) {
  const { hasPermission } = usePermissions();
  const canReadLeave = hasPermission("leave.calendar.read");
  const showRegularization = hasPermission("regularization.create");
  const showCompOff = hasPermission("comp_off.create");

  const { data: me } = useEmployeeMeQuery();
  const { data: today } = useAttendanceTodayQuery();

  const {
    eventMap: leaveEventMap,
    isLoading: leaveLoading,
    isError: leaveError,
    error: leaveErr,
    hasEvents: hasLeaveEvents,
  } = useLeaveMonthEvents(year, month, "self");

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError: attendanceError,
    error: attendanceErr,
  } = useAttendanceMonthlySummaryQuery(year, month);

  const { eventMap: regularizationEventMap } = useRegularizationCalendarEvents(year, month);
  const { eventMap: compOffEventMap } = useCompOffCalendarEvents(year, month);

  /** Monthly summary often lags / omits today's open session — overlay /attendance/today. */
  const attendanceRecords = useMemo(() => {
    const records = [...(attendanceData?.records ?? [])];
    if (!today?.date) return records;

    let todayKey: string;
    try {
      todayKey = toLocalDateKey(today.date);
    } catch {
      return records;
    }

    const [y, m] = todayKey.split("-").map(Number);
    if (y !== year || m !== month) return records;

    const overlay: AttendanceRecord = {
      id: today.id ?? `today-${todayKey}`,
      employeeProfileId: "",
      userId: "",
      date: today.date,
      punchIn: today.punchIn,
      punchOut: today.punchOut,
      punchSessions: today.punchSessions,
      grossWorkingMinutes: today.grossWorkingMinutes,
      breakDurationMinutes: today.breakDurationMinutes,
      netWorkingMinutes: today.netWorkingMinutes,
      lateByMinutes: today.lateByMinutes,
      isRegularized: today.isRegularized,
      attendanceStatus: today.attendanceStatus,
      attendanceSource: today.attendanceSource,
      isAutoPunchOut: today.isAutoPunchOut,
      shift: today.shift,
    };

    const idx = records.findIndex((r) => {
      try {
        return toLocalDateKey(r.date) === todayKey;
      } catch {
        return false;
      }
    });
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...overlay, id: records[idx].id || overlay.id };
    } else {
      records.push(overlay);
    }
    return records;
  }, [attendanceData?.records, month, today, year]);

  const eventMap = useMemo(() => {
    const attendanceMap = buildAttendanceEventMap(attendanceRecords, {
      workingDays: me?.workingDays,
    });
    let merged: CalendarEventMap = canReadLeave
      ? mergeCalendarEventMaps(leaveEventMap, attendanceMap)
      : attendanceMap;

    if (showCompOff) {
      merged = mergeCompOffIntoEventMap(merged, compOffEventMap);
    }
    if (showRegularization) {
      merged = mergeRegularizationIntoEventMap(merged, regularizationEventMap);
    }
    return merged;
  }, [
    attendanceRecords,
    canReadLeave,
    compOffEventMap,
    leaveEventMap,
    me?.workingDays,
    regularizationEventMap,
    showCompOff,
    showRegularization,
  ]);

  const punchMap = useMemo(
    () => buildAttendancePunchMap(attendanceRecords),
    [attendanceRecords]
  );

  return {
    eventMap,
    punchMap,
    attendanceData,
    isLoading: (canReadLeave && leaveLoading) || attendanceLoading,
    // Don't blank the whole calendar if leave-calendar API fails — still show attendance.
    isError: attendanceError,
    error: attendanceErr,
    leaveError: canReadLeave ? leaveError : false,
    leaveErr: canReadLeave ? leaveErr : undefined,
    hasEvents: eventMap.size > 0 || hasLeaveEvents,
  };
}
