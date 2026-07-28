"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflowDashboardQuery } from "@/hooks/queries/use-workflow-queries";
import { useLeaveListQuery, useLeaveBalancesQuery } from "@/hooks/queries/use-leave-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export function ManagerLeaveDashboard() {
  const { hasPermission } = usePermissions();
  const canViewBalances = hasPermission("leave.balance.read");
  const { data: workflow, isLoading: wfLoading } = useWorkflowDashboardQuery();
  const { data: teamLeaves, isLoading: teamLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });
  const { data: balances, isLoading: balLoading } = useLeaveBalancesQuery();

  const isLoading = wfLoading || teamLoading || (canViewBalances && balLoading);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const leavePending = teamLeaves?.meta.total ?? 0;
  const totalBalance = balances?.reduce((sum, item) => sum + (item.balance ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canViewBalances && <StatCard title="My leave balance" value={totalBalance} />}
        <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
          <StatCard title="Pending approvals" value={leavePending} />
        </Link>
        <StatCard title="My approved requests" value={workflow?.stats.myApprovedRequests ?? 0} />
        <StatCard title="Escalated" value={workflow?.stats.escalated ?? 0} />
      </div>

      <Link href={ROUTES.approvals} className={cn(buttonVariants())}>
        Open Approvals
      </Link>
    </div>
  );
}
