"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  useAttendanceMonthlySummaryQuery,
  useAttendanceTodayQuery,
} from "@/hooks/queries/use-attendance-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import { toLocalDateKey } from "@/lib/date/calendar";
import { monthDateKey } from "@/lib/date/month-calendar";
import { isNonWorkingDay, isWorkingDay } from "@/lib/employee/working-days";
import {
  appendCalendarEvents,
  buildRegularizationEligibleEventMap,
  type CalendarEventMap,
} from "@/lib/calendar/calendar-events";
import { regularizationService } from "@/services/regularization/regularization.service";
import type { AttendanceRecord, AttendanceToday } from "@/types/attendance";

/** Same local-day key used by attendance calendar (`buildAttendanceEventMap`). */
function toCalendarDateKey(value?: string | null) {
  if (!value) return null;
  try {
    return toLocalDateKey(value);
  } catch {
    return null;
  }
}

function isLateNotRegularized(input: {
  attendanceStatus?: string | null;
  status?: string | null;
  lateByMinutes?: number | null;
  isRegularized?: boolean | null;
}) {
  if (input.isRegularized) return false;
  const status = (input.attendanceStatus ?? input.status ?? "").toLowerCase();
  if (status === "regularized") return false;
  if (status === "late") return true;
  return (input.lateByMinutes ?? 0) > 0;
}

function isTodayLateCandidate(today?: AttendanceToday | null) {
  if (!today) return false;
  return isLateNotRegularized(today);
}

/**
 * Calendar markers for regularization — date keys match attendance calendar (local timezone).
 */
export function useRegularizationCalendarEvents(year: number, month: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("regularization.create");

  const { data: today } = useAttendanceTodayQuery();
  const { data: attendanceData } = useAttendanceMonthlySummaryQuery(year, month);
  const { data: me } = useEmployeeMeQuery();
  const workingDays = me?.workingDays;

  const todayLocalKey = useMemo(() => {
    const now = new Date();
    if (now.getFullYear() !== year || now.getMonth() + 1 !== month) return null;
    return toCalendarDateKey(today?.date) ?? monthDateKey(year, month, now.getDate());
  }, [month, today?.date, year]);

  const candidateDates = useMemo(() => {
    const dates = new Set<string>();

    (attendanceData?.records ?? []).forEach((record: AttendanceRecord) => {
      if (!isLateNotRegularized(record)) return;
      const key = toCalendarDateKey(record.date);
      if (!key) return;
      // Weekends / off days are OT → comp-off, not late regularization.
      if (isNonWorkingDay(key, workingDays)) return;
      dates.add(key);
    });

    if (todayLocalKey && isWorkingDay(todayLocalKey, workingDays)) {
      dates.add(todayLocalKey);
    }

    return Array.from(dates).sort();
  }, [attendanceData?.records, todayLocalKey, workingDays]);

  const eligibilityQueries = useQueries({
    queries: candidateDates.map((date) => ({
      queryKey: QUERY_KEYS.regularization.eligibility(date),
      queryFn: () => regularizationService.getEligibility(date),
      enabled: isAuthenticated && canCreate && Boolean(date),
      retry: false,
      staleTime: 60_000,
    })),
  });

  const lateDateSet = useMemo(() => {
    const set = new Set<string>();
    (attendanceData?.records ?? []).forEach((record) => {
      if (!isLateNotRegularized(record)) return;
      const key = toCalendarDateKey(record.date);
      if (!key || isNonWorkingDay(key, workingDays)) return;
      set.add(key);
    });
    if (
      isTodayLateCandidate(today) &&
      todayLocalKey &&
      isWorkingDay(todayLocalKey, workingDays)
    ) {
      set.add(todayLocalKey);
    }
    return set;
  }, [attendanceData?.records, today, todayLocalKey, workingDays]);

  const regularizedDateSet = useMemo(() => {
    const set = new Set<string>();
    (attendanceData?.records ?? []).forEach((record) => {
      const status = (record.attendanceStatus ?? record.status ?? "").toLowerCase();
      if (record.isRegularized || status === "regularized") {
        const key = toCalendarDateKey(record.date);
        if (key) set.add(key);
      }
    });
    if (today?.isRegularized && todayLocalKey) set.add(todayLocalKey);
    return set;
  }, [attendanceData?.records, today?.isRegularized, todayLocalKey]);

  const eligibilitySnapshot = eligibilityQueries
    .map(
      (query) =>
        `${query.fetchStatus}:${query.status}:${query.data?.isEligible ?? ""}:${query.data?.hasExistingRequest ?? ""}`
    )
    .join("|");

  const eligibleDates = useMemo(() => {
    if (!canCreate) return [];

    return candidateDates.filter((date, index) => {
      // Never suggest regularize on a day that is already regularized.
      if (regularizedDateSet.has(date)) return false;

      const query = eligibilityQueries[index];
      const eligibility = query?.data;

      if (eligibility?.hasExistingRequest) return false;
      if (eligibility?.isEligible === true) return true;
      if (eligibility?.isEligible === false) return false;

      // Eligibility still loading / failed — mirror attendance CTA for late days.
      return lateDateSet.has(date);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCreate, candidateDates, eligibilitySnapshot, lateDateSet, regularizedDateSet]);

  const eventMap = useMemo(
    () => buildRegularizationEligibleEventMap(eligibleDates),
    [eligibleDates]
  );

  return {
    eventMap,
    eligibleDates,
    isLoading: false,
    enabled: canCreate,
  };
}

export function mergeRegularizationIntoEventMap(
  base: CalendarEventMap,
  regularizationMap: CalendarEventMap
) {
  return appendCalendarEvents(base, regularizationMap, { prepend: true });
}
