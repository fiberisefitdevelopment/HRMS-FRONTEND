"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useAuthStore } from "@/store/auth-store";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useHrAttendanceDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { HrBirthdaysCard } from "@/features/dashboard/hr/hr-birthdays-card";
import { HrNewJoinersCard } from "@/features/dashboard/hr/hr-new-joiners-card";
import { UpcomingHolidaysCard } from "@/features/dashboard/upcoming-holidays-card";
import { MusterRoll } from "@/features/attendance/muster-roll";
import { OwnerDashboardHeader } from "@/features/dashboard/owner/owner-dashboard-header";
import { OwnerQuickActions } from "@/features/dashboard/owner/owner-quick-actions";
import { OwnerWorkforceTodayCard } from "@/features/dashboard/owner/owner-workforce-today-card";
import { OwnerOrgSnapshotCard } from "@/features/dashboard/owner/owner-org-snapshot-card";
import { OwnerAttentionStrip } from "@/features/dashboard/owner/owner-attention-strip";
import { OwnerWorkforceInsight } from "@/features/dashboard/owner/owner-workforce-insight";
import { computeOwnerWorkforceSummary } from "@/lib/employee/owner-dashboard-helpers";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? "there";
  const companyName = user?.company?.name;

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
    const summary = computeOwnerWorkforceSummary(employees, records, user?.id);
    const leavePending = pendingLeaves?.meta.total ?? 0;

    return { ...summary, pendingApprovals: leavePending };
  }, [attendanceData?.records, employeesData?.data, pendingLeaves?.meta.total, user?.id]);

  const statsLoading = empLoading || attLoading || leaveLoading;
  const dateLabel = new Date().toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp} className="space-y-3">
        <OwnerDashboardHeader
          greeting={getGreeting()}
          firstName={firstName}
          companyName={companyName}
          dateLabel={dateLabel}
          workforceTotal={stats.workforceTotal}
          atWork={stats.atWork}
          onLeave={stats.onLeave}
          pendingApprovals={stats.pendingApprovals}
          attendanceRate={stats.attendanceRate}
          isLoading={statsLoading}
        />
        {!statsLoading && (
          <OwnerQuickActions
            workforceTotal={stats.workforceTotal}
            pendingApprovals={stats.pendingApprovals}
          />
        )}
      </motion.div>

      {!statsLoading && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <OwnerAttentionStrip pendingApprovals={stats.pendingApprovals} />
          <OwnerWorkforceInsight
            yetToPunch={stats.yetToPunch}
            late={stats.late}
            atWork={stats.atWork}
          />
        </motion.div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={fadeInUp} className="space-y-5 lg:col-span-2">
          <OwnerWorkforceTodayCard />
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-5">
          <OwnerOrgSnapshotCard />
          <HrBirthdaysCard />
          <HrNewJoinersCard />
          <UpcomingHolidaysCard />
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <MusterRoll />
      </motion.div>
    </motion.div>
  );
}
