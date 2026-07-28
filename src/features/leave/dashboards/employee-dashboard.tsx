"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveListQuery, useLeaveMonthlySummaryQuery, useLeaveBalancesQuery } from "@/hooks/queries/use-leave-queries";
import { useWorkflowDashboardQuery } from "@/hooks/queries/use-workflow-queries";
import { usePermissions } from "@/hooks/use-permissions";
import type { LeaveScope } from "@/types/leave";

export function EmployeeLeaveDashboard({ scope }: { scope?: LeaveScope } = {}) {
  const { hasPermission } = usePermissions();
  const canViewBalances = hasPermission("leave.balance.read");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const listParams = scope && scope !== "company" ? { scope } : undefined;
  const { data: requests, isLoading: reqLoading } = useLeaveListQuery({
    limit: 5,
    sort: "-createdAt",
    ...listParams,
  });
  const { data: summary, isLoading: sumLoading } = useLeaveMonthlySummaryQuery(year, month);
  const { data: workflow, isLoading: wfLoading } = useWorkflowDashboardQuery();
  const { data: balances, isLoading: balLoading } = useLeaveBalancesQuery();

  const isLoading = reqLoading || sumLoading || wfLoading || (canViewBalances && balLoading);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const pending = requests?.data.filter((r) => r.status === "pending").length ?? 0;
  const approved = requests?.data.filter((r) => r.status === "approved").length ?? 0;
  const rejected = requests?.data.filter((r) => r.status === "rejected").length ?? 0;
  const totalBalance = balances?.reduce((sum, item) => sum + (item.balance ?? 0), 0) ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {canViewBalances && <StatCard title="Total leave balance" value={totalBalance} />}
      <StatCard title="Pending" value={pending} />
      <StatCard title="Approved (recent)" value={approved} />
      <StatCard title="Rejected (recent)" value={rejected} />
      <StatCard title="My pending workflows" value={workflow?.stats.myPendingRequests ?? 0} />
      <StatCard title="Monthly requests" value={summary?.totalRequests ?? 0} />
    </div>
  );
}
