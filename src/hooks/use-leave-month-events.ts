"use client";

import { useMemo } from "react";
import { buildLeaveEventMap } from "@/lib/calendar/calendar-events";
import { getMonthBounds } from "@/lib/date/month-calendar";
import { useLeaveCalendarQuery, useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { useLeavePolicyQuery } from "@/hooks/queries/use-leave-policy-queries";
import type { LeaveScope } from "@/types/leave";

function resolveLeaveScope(scope: LeaveScope = "self") {
  return scope === "company" ? undefined : scope;
}

export function useLeaveMonthEvents(year: number, month: number, scope: LeaveScope = "self") {
  const { monthStart, monthEnd } = getMonthBounds(year, month);
  const apiScope = resolveLeaveScope(scope);
  const listParams = {
    startDate: monthStart,
    endDate: monthEnd,
    limit: 100,
    ...(apiScope ? { scope: apiScope } : {}),
  };

  const { data: calendarData, isLoading: calendarLoading, isError, error } = useLeaveCalendarQuery(
    year,
    month,
    apiScope
  );
  const { data: pendingData, isLoading: pendingLoading } = useLeaveListQuery({
    status: "pending",
    ...listParams,
  });
  const { data: rejectedData, isLoading: rejectedLoading } = useLeaveListQuery({
    status: "rejected",
    ...listParams,
  });
  const { data: policy, isLoading: policyLoading } = useLeavePolicyQuery();

  const eventMap = useMemo(
    () =>
      buildLeaveEventMap({
        approvedEvents: calendarData?.events,
        pendingLeaves: pendingData?.data,
        rejectedLeaves: rejectedData?.data,
        holidays: policy?.holidays,
      }),
    [calendarData, pendingData, rejectedData, policy]
  );

  const isLoading = calendarLoading || pendingLoading || rejectedLoading || policyLoading;

  return {
    eventMap,
    isLoading,
    isError,
    error,
    hasEvents:
      Boolean(calendarData?.events.length) ||
      Boolean(pendingData?.data.length) ||
      Boolean(rejectedData?.data.length) ||
      Boolean(policy?.holidays?.length),
  };
}
