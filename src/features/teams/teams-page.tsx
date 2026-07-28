"use client";

import Link from "next/link";
import { Clock, CalendarDays, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { TeamRosterCard } from "@/features/dashboard/manager/team-roster-card";
import { useManagerTeamQuery } from "@/hooks/queries/use-manager-queries";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { ROUTES } from "@/config/routes";

const LENSES = [
  {
    href: "/attendance",
    title: "Team Attendance",
    description: "Punches, working hours and daily status for your team",
    icon: Clock,
  },
  {
    href: "/teams/leave",
    title: "Team Leave",
    description: "Leave requests, balances and the team calendar",
    icon: CalendarDays,
  },
  {
    href: ROUTES.approvals,
    title: "Approvals",
    description: "Review and act on requests waiting on you",
    icon: ClipboardCheck,
  },
];

export function TeamsPage() {
  const { data: teamData, isLoading: teamLoading } = useManagerTeamQuery({ limit: 1 });
  const { data: pendingLeaves, isLoading: pendingLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });

  const teamSize = teamData?.meta.total ?? 0;
  const pendingCount = pendingLeaves?.meta.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Your team at a glance — open a member to manage everything about them"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {teamLoading || pendingLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard title="Team members" value={teamSize} icon={Users} />
            <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
              <StatCard title="Pending leave" value={pendingCount} icon={ClipboardCheck} />
            </Link>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {LENSES.map((lens) => {
          const Icon = lens.icon;
          return (
            <Link
              key={lens.href}
              href={lens.href}
              className="group rounded-xl border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">{lens.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{lens.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamRosterCard limit={8} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manage a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open any team member to access their attendance, leave, documents and workflow history in
            a single workspace.
          </p>
          <Link
            href="/employees"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
          >
            Browse team members
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
