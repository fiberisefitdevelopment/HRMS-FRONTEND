"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, PlusCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { LeaveBalancePanel } from "@/features/leave/leave-balance-panel";
import { LeaveCalendar } from "@/features/leave/leave-calendar";
import { EmployeeAttendanceCard } from "@/features/dashboard/employee-attendance-card";
import { UpcomingHolidaysCard } from "@/features/dashboard/upcoming-holidays-card";
import { RecentLeaveRequestsCard } from "@/features/dashboard/recent-leave-requests-card";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import { Can } from "@/components/guards/permission-guard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);
  const { hasPermission } = usePermissions();
  const canBalance = hasPermission("leave.balance.read");
  const canCalendar = hasPermission("leave.calendar.read");
  const canAttendance = hasPermission("attendance.dashboard");
  const canCreateLeave = hasPermission("leave.create");
  const firstName = user?.firstName ?? "there";

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
              <Can permission="leave.create">
                <Link href="/leave" className={cn(buttonVariants())}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Apply Leave
                </Link>
              </Can>
              <Can permission="attendance.punch">
                <Link href="/attendance" className={cn(buttonVariants({ variant: "outline" }))}>
                  <Clock className="mr-2 h-4 w-4" />
                  Attendance
                </Link>
              </Can>
            </div>
          }
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={fadeInUp} className="space-y-6 lg:col-span-2">
          {canBalance && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Leave Balance</h2>
              <LeaveBalancePanel />
            </section>
          )}

          {canCalendar && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Leave Calendar
                </CardTitle>
                <Link
                  href="/leave"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
                >
                  Full calendar
                </Link>
              </CardHeader>
              <CardContent>
                <LeaveCalendar compact />
              </CardContent>
            </Card>
          )}

          {canCreateLeave && <RecentLeaveRequestsCard />}
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-6">
          {canAttendance && <EmployeeAttendanceCard />}
          <UpcomingHolidaysCard />
        </motion.div>
      </div>
    </motion.div>
  );
}
