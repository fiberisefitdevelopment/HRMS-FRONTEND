"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAttendanceMonthlySummaryQuery } from "@/hooks/queries/use-attendance-queries";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import { toLocalDateKey } from "@/lib/date/calendar";
import { isNonWorkingDay } from "@/lib/employee/working-days";
import {
  appendCalendarEvents,
  buildCompOffEligibleEventMap,
  type CalendarEventMap,
} from "@/lib/calendar/calendar-events";
import { compOffService } from "@/services/comp-off/comp-off.service";
import type { AttendanceRecord } from "@/types/attendance";

function toCalendarDateKey(value?: string | null) {
  if (!value) return null;
  try {
    return toLocalDateKey(value);
  } catch {
    return null;
  }
}

function hasOffDayWorkSignal(record: AttendanceRecord) {
  const status = (record.attendanceStatus ?? record.status ?? "").toLowerCase();
  if (["present", "late", "regularized", "half_day", "missing_punch", "auto_punch_out"].includes(status)) {
    return true;
  }
  return Boolean(record.punchIn) || (record.lateByMinutes ?? 0) > 0 || (record.netWorkingMinutes ?? 0) > 0;
}

/**
 * Comp-off markers for off-day / weekend work — candidacy from workingDays + attendance,
 * eligibility confirmed via GET /comp-off/eligibility.
 */
export function useCompOffCalendarEvents(year: number, month: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("comp_off.create");

  const { data: me } = useEmployeeMeQuery();
  const { data: attendanceData } = useAttendanceMonthlySummaryQuery(year, month);
  const workingDays = me?.workingDays;

  const candidateDates = useMemo(() => {
    const dates = new Set<string>();
    (attendanceData?.records ?? []).forEach((record) => {
      const key = toCalendarDateKey(record.date);
      if (!key) return;
      if (!isNonWorkingDay(key, workingDays)) return;
      if (!hasOffDayWorkSignal(record)) return;
      dates.add(key);
    });
    return Array.from(dates).sort();
  }, [attendanceData?.records, workingDays]);

  const eligibilityQueries = useQueries({
    queries: candidateDates.map((date) => ({
      queryKey: QUERY_KEYS.compOff.eligibility(date),
      queryFn: () => compOffService.getEligibility(date),
      enabled: isAuthenticated && canCreate && Boolean(date),
      retry: false,
      staleTime: 60_000,
    })),
  });

  const eligibilitySnapshot = eligibilityQueries
    .map(
      (query) =>
        `${query.fetchStatus}:${query.status}:${query.data?.isEligible ?? ""}:${query.data?.hasExistingRequest ?? ""}`
    )
    .join("|");

  const eligibleDates = useMemo(() => {
    if (!canCreate) return [];
    return candidateDates.filter((date, index) => {
      const eligibility = eligibilityQueries[index]?.data;
      if (eligibility?.hasExistingRequest) return false;
      if (eligibility?.isEligible === true) return true;
      if (eligibility?.isEligible === false) return false;
      // Still loading — surface for off-day work (backend may require punch-out OT).
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCreate, candidateDates, eligibilitySnapshot]);

  const eventMap = useMemo(
    () => buildCompOffEligibleEventMap(eligibleDates),
    [eligibleDates]
  );

  return {
    eventMap,
    eligibleDates,
    enabled: canCreate,
  };
}

export function mergeCompOffIntoEventMap(base: CalendarEventMap, extra: CalendarEventMap) {
  return appendCalendarEvents(base, extra, { prepend: true });
}
