"use client";

import { useQuery } from "@tanstack/react-query";
import { holidayService } from "@/services/holidays/holiday.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";

export function useHolidaysQuery(params?: { year?: number; upcoming?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.holidays.all(params),
    queryFn: () => holidayService.list(params),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
