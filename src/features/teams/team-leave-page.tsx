"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveCalendar } from "@/features/leave/leave-calendar";
import { LeaveHistory } from "@/features/leave/leave-history";
import { TeamRosterCard } from "@/features/dashboard/manager/team-roster-card";
import { useManagerTeamQuery } from "@/hooks/queries/use-manager-queries";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { ROUTES } from "@/config/routes";

export function TeamLeavePage() {
  const { data: teamData, isLoading: teamLoading } = useManagerTeamQuery({ limit: 1 });
  const { data: pendingLeaves, isLoading: pendingLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });
  const { data: approvedLeaves, isLoading: approvedLoading } = useLeaveListQuery({
    status: "approved",
    limit: 1,
  });

  const statsLoading = teamLoading || pendingLoading || approvedLoading;
  const leaveApprovals = pendingLeaves?.meta.total ?? 0;

  const stats = useMemo(
    () => ({
      teamSize: teamData?.meta.total ?? 0,
      pending: pendingLeaves?.meta.total ?? 0,
      approved: approvedLeaves?.meta.total ?? 0,
      awaitingAction: leaveApprovals,
    }),
    [teamData?.meta.total, pendingLeaves?.meta.total, approvedLeaves?.meta.total, leaveApprovals]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Leave"
        description="Leave history and calendar for your direct reports"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.approvals} className={cn(buttonVariants())}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Approvals
            </Link>
            <Link href="/teams" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to teams
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard title="Team members" value={stats.teamSize} icon={CalendarDays} />
            <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
              <StatCard title="Pending requests" value={stats.pending} icon={ClipboardCheck} />
            </Link>
            <StatCard title="Approved (team)" value={stats.approved} />
            <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
              <StatCard
                title="Awaiting your action"
                value={stats.awaitingAction}
                icon={ClipboardCheck}
              />
            </Link>
          </>
        )}
      </div>

      <Tabs defaultValue="history">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="history">Team history</TabsTrigger>
          <TabsTrigger value="calendar">Team calendar</TabsTrigger>
          <TabsTrigger value="roster">Team roster</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <LeaveHistory scope="team" />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <LeaveCalendar scope="team" />
        </TabsContent>

        <TabsContent value="roster" className="mt-4">
          <TeamRosterCard limit={20} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
