"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ClipboardCheck, Clock, PlusCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { LeaveBalancePanel } from "@/features/leave/leave-balance-panel";
import { LeaveCalendar } from "@/features/leave/leave-calendar";
import { EmployeeAttendanceCard } from "@/features/dashboard/employee-attendance-card";
import { UpcomingHolidaysCard } from "@/features/dashboard/upcoming-holidays-card";
import { TeamRosterCard } from "@/features/dashboard/manager/team-roster-card";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import { useManagerTeamQuery } from "@/hooks/queries/use-manager-queries";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/guards/permission-guard";
import { ROUTES } from "@/config/routes";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function ManagerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { hasPermission } = usePermissions();
  const canBalance = hasPermission("leave.balance.read");
  const canCalendar = hasPermission("leave.calendar.read");
  const canAttendance = hasPermission("attendance.dashboard");
  const canCreateLeave = hasPermission("leave.create");
  const firstName = user?.firstName ?? "there";

  const { data: teamData, isLoading: teamLoading } = useManagerTeamQuery({ limit: 1 });
  const { data: pendingLeaves, isLoading: pendingLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });

  const teamSize = teamData?.meta.total ?? 0;
  const pendingCount = pendingLeaves?.meta.total ?? 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title={`${getGreeting()}, ${firstName}`}
          description={new Date().toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href={ROUTES.approvals} className={cn(buttonVariants())}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Approvals
                {pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Can permission="leave.create">
                <Link href="/leave" className={cn(buttonVariants({ variant: "outline" }))}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Apply Leave
                </Link>
              </Can>
              <Link href="/attendance" className={cn(buttonVariants({ variant: "outline" }))}>
                <Clock className="mr-2 h-4 w-4" />
                Attendance
              </Link>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid gap-3 sm:grid-cols-2">
          {teamLoading || pendingLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <StatCard title="Team members" value={teamSize} icon={Users} />
              <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
                <StatCard title="Pending approvals" value={pendingCount} icon={ClipboardCheck} />
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={fadeInUp} className="space-y-6 lg:col-span-2">
          {canAttendance && <EmployeeAttendanceCard />}

          {canBalance && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">My Leave Balance</h2>
              <LeaveBalancePanel />
            </section>
          )}

          {canCalendar && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  My Leave Calendar
                </CardTitle>
                <Link href="/leave" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>
                  Full calendar
                </Link>
              </CardHeader>
              <CardContent>
                <LeaveCalendar compact />
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-6">
          <TeamRosterCard />
          <UpcomingHolidaysCard />
        </motion.div>
      </div>
    </motion.div>
  );
}
