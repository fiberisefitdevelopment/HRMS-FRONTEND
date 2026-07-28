"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveMonthlySummaryQuery, useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { useWorkflowDashboardQuery } from "@/hooks/queries/use-workflow-queries";

export function HrLeaveDashboard() {
  const now = new Date();
  const { data: summary, isLoading: sumLoading } = useLeaveMonthlySummaryQuery(
    now.getFullYear(),
    now.getMonth() + 1
  );
  const { data: pending, isLoading: pendingLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });
  const { data: workflow, isLoading: wfLoading } = useWorkflowDashboardQuery();

  const isLoading = sumLoading || pendingLoading || wfLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const summaryEntries = Object.entries(summary?.summary ?? {});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total requests (month)" value={summary?.totalRequests ?? 0} />
        <StatCard title="Company pending" value={pending?.meta.total ?? 0} />
        <StatCard title="Pending approvals" value={workflow?.stats.pendingApprovals ?? 0} />
        <StatCard title="Escalated" value={workflow?.stats.escalated ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave type summary (this month)</CardTitle>
        </CardHeader>
        <CardContent>
          {!summaryEntries.length ? (
            <p className="text-sm text-muted-foreground">No summary data from API.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {summaryEntries.map(([code, item]) => (
                <div key={code} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{code}</p>
                  <p className="text-muted-foreground">
                    Approved: {item.approved} · Pending: {item.pending} · Rejected: {item.rejected}
                  </p>
                  <p className="text-muted-foreground">Total days: {item.totalDays}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
