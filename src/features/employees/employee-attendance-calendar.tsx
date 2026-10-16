"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthCalendarGrid } from "@/components/calendar/month-calendar-grid";
import { MonthCalendarNav } from "@/components/calendar/month-calendar-nav";
import { useMonthCalendarState } from "@/hooks/use-month-calendar-state";
import { attendanceService } from "@/services/attendance/attendance.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  buildAttendanceEventMap,
  buildAttendancePunchMap,
} from "@/lib/calendar/calendar-events";
import { getErrorMessage } from "@/services/api/error-handler";

function monthBounds(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    dateFrom: `${year}-${pad(month)}-01`,
    dateTo: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

export function EmployeeAttendanceCalendar({
  employeeProfileId,
  workingDays,
}: {
  employeeProfileId: string;
  workingDays?: number[] | null;
}) {
  const { year, month, prevMonth, nextMonth } = useMonthCalendarState();
  const { dateFrom, dateTo } = monthBounds(year, month);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEYS.attendance.byEmployee(employeeProfileId, { year, month }),
    queryFn: () =>
      attendanceService.listByEmployee(employeeProfileId, {
        page: 1,
        limit: 100,
        sort: "date",
        dateFrom,
        dateTo,
      }),
  });

  const records = data?.data;
  const eventMap = useMemo(
    () => buildAttendanceEventMap(records ?? [], { workingDays }),
    [records, workingDays]
  );
  const punchMap = useMemo(() => buildAttendancePunchMap(records ?? []), [records]);

  if (isLoading) return <Skeleton className="h-96" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <MonthCalendarNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
      <MonthCalendarGrid year={year} month={month} eventMap={eventMap} punchMap={punchMap} />
    </div>
  );
}
