"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Users,
  UserPlus,
  Cake,
  Clock,
  UserX,
  CalendarDays,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { Can } from "@/components/guards/permission-guard";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useHrAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { HrQuickSearch } from "@/features/dashboard/hr/hr-quick-search";
import { HrAttendanceTodayCard } from "@/features/dashboard/hr/hr-attendance-today-card";
import { HrYetToPunchCard } from "@/features/dashboard/hr/hr-yet-to-punch-card";
import { HrBirthdaysCard } from "@/features/dashboard/hr/hr-birthdays-card";
import { HrNewJoinersCard } from "@/features/dashboard/hr/hr-new-joiners-card";
import { UpcomingHolidaysCard } from "@/features/dashboard/upcoming-holidays-card";
import { MusterRoll } from "@/features/attendance/muster-roll";
import {
  getBirthdaysToday,
  getEmployeesOnLeaveToday,
  getRecentJoiners,
  getYetToPunchEmployees,
} from "@/lib/employee/dashboard-helpers";
import { ROUTES } from "@/config/routes";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HRDashboard() {
  const user = useAuthStore((s) => s.user);
  const { hasPermission } = usePermissions();
  const firstName = user?.firstName ?? "there";

  const canAttendance = hasPermission("attendance.dashboard");
  const { data: employeesData, isLoading: empLoading } = useEmployeesQuery({
    status: "active",
    limit: 500,
    sort: "firstName",
  });
  const { data: attendanceData, isLoading: attLoading } = useHrAttendanceDashboardQuery();
  const { data: pendingLeaves, isLoading: leaveLoading } = useLeaveListQuery({
    status: "pending",
    limit: 1,
  });

  const stats = useMemo(() => {
    const employees = employeesData?.data ?? [];
    const records = attendanceData?.records ?? [];
    const yetToPunch = getYetToPunchEmployees(employees, records);
    const onLeave = getEmployeesOnLeaveToday(records);
    const birthdays = getBirthdaysToday(employees);
    const newJoiners = getRecentJoiners(employees);
    const leavePending = pendingLeaves?.meta.total ?? 0;
    const summary = attendanceData?.summary;
    const atWork = summary ? summary.present + summary.late + (summary.regularized ?? 0) : 0;

    return {
      activeEmployees: employeesData?.meta.total ?? employees.length,
      pendingApprovals: leavePending,
      atWork,
      yetToPunch: yetToPunch.length,
      onLeave: onLeave.length,
      birthdays: birthdays.length,
      newJoiners: newJoiners.length,
    };
  }, [attendanceData, employeesData, pendingLeaves?.meta.total]);

  const statsLoading = empLoading || attLoading || leaveLoading;

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
                {stats.pendingApprovals > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
              <Can permission="employee.create">
                <Link href="/employees/new" className={cn(buttonVariants({ variant: "outline" }))}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Link>
              </Can>
              <Can permission="employee.create">
                <Link href="/employees/import" className={cn(buttonVariants({ variant: "outline" }))}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Link>
              </Can>
              <Link href="/employees" className={cn(buttonVariants({ variant: "outline" }))}>
                <Users className="mr-2 h-4 w-4" />
                People
              </Link>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <HrQuickSearch />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <Link href={ROUTES.approvals} className="block transition-opacity hover:opacity-90">
                <StatCard
                  title="Pending approvals"
                  value={stats.pendingApprovals}
                  icon={ClipboardCheck}
                />
              </Link>
              <StatCard title="At work today" value={stats.atWork} icon={Clock} />
              <StatCard title="Yet to punch in" value={stats.yetToPunch} icon={UserX} />
              <StatCard title="On leave today" value={stats.onLeave} icon={CalendarDays} />
              <StatCard title="New joiners (30d)" value={stats.newJoiners} icon={UserPlus} />
              <StatCard title="Birthdays today" value={stats.birthdays} icon={Cake} />
            </>
          )}
        </div>
      </motion.div>

      {canAttendance && (
        <motion.div variants={fadeInUp}>
          <HrAttendanceTodayCard />
        </motion.div>
      )}

      <Can permission="attendance.report">
        <motion.div variants={fadeInUp}>
          <MusterRoll />
        </motion.div>
      </Can>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canAttendance && (
          <motion.div variants={fadeInUp} className="h-72 min-h-0">
            <HrYetToPunchCard />
          </motion.div>
        )}
        <motion.div variants={fadeInUp} className="h-72 min-h-0">
          <HrBirthdaysCard />
        </motion.div>
        <motion.div variants={fadeInUp} className="h-72 min-h-0">
          <HrNewJoinersCard />
        </motion.div>
        <motion.div variants={fadeInUp} className="h-72 min-h-0">
          <UpcomingHolidaysCard />
        </motion.div>
      </div>
    </motion.div>
  );
}
