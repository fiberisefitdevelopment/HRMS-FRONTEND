"use client";

import { useMemo } from "react";
import { useLeavePolicyQuery } from "@/hooks/queries/use-leave-policy-queries";
import { useLeaveBalancesQuery } from "@/hooks/queries/use-leave-queries";
import { buildLeaveTypeOptions } from "@/lib/leave/leave-type-options";

export function useLeaveTypeOptions() {
  const policyQuery = useLeavePolicyQuery();
  const balancesQuery = useLeaveBalancesQuery();

  const options = useMemo(
    () => buildLeaveTypeOptions(policyQuery.data, balancesQuery.data),
    [policyQuery.data, balancesQuery.data]
  );

  const isLoading =
    (policyQuery.isLoading && policyQuery.fetchStatus !== "idle") ||
    (balancesQuery.isLoading && balancesQuery.fetchStatus !== "idle");

  return {
    options,
    isLoading,
    policyQuery,
    balancesQuery,
    hasPolicyAccess: policyQuery.isSuccess,
    policyError: policyQuery.isError ? policyQuery.error : null,
  };
}
