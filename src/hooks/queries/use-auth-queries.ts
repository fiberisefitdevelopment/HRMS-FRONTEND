"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";
import { mapApiUser } from "@/lib/auth/auth-mapper";
import { QUERY_KEYS } from "@/constants/query-keys";
import { hasStoredSession } from "@/lib/auth/token-storage";
import { handleApiError } from "@/services/api/error-handler";

export function useSessionQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const result = await authService.getMe();
      return {
        user: mapApiUser(result.user, result.permissions),
        permissions: result.permissions,
      };
    },
    enabled: enabled && hasStoredSession(),
    retry: (failureCount, error) => {
      const apiError = handleApiError(error);
      if (apiError.statusCode === 401 || apiError.statusCode === 403) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}
