"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Can } from "@/components/guards/permission-guard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PunchPanel } from "./punch-panel";
import { AttendanceHistory } from "./attendance-history";
import { AttendanceCalendar } from "./attendance-calendar";
import { EmployeeAttendanceDashboard } from "./dashboards/employee-dashboard";
import { HrAttendanceDashboard } from "./dashboards/hr-dashboard";
import { ManagerAttendanceDashboard } from "./dashboards/manager-dashboard";
import { usePermissions } from "@/hooks/use-permissions";

export function AttendancePage() {
  const { hasPermission, hasRole } = usePermissions();
  const canPunch = hasPermission("attendance.punch");
  const canDashboard = hasPermission("attendance.dashboard");
  const canReport = hasPermission("attendance.report");
  const isEmployee = hasRole("employee");

  const dashboard = useMemo(() => {
    if (!canDashboard) return null;
    if (hasRole("owner") || hasRole("hr")) return <HrAttendanceDashboard />;
    if (hasRole("manager")) return <ManagerAttendanceDashboard />;
    return <EmployeeAttendanceDashboard />;
  }, [canDashboard, hasRole]);

  const defaultTab = isEmployee ? "calendar" : canDashboard ? "dashboard" : "calendar";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={
          isEmployee
            ? "View your calendar, history, and today's sessions"
            : "Track attendance, punches, and working hours"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Can permission="attendance.shift.manage">
              <Link href="/attendance/shifts" className={cn(buttonVariants({ variant: "outline" }))}>
                Shifts
              </Link>
            </Can>
            {canReport && (
              <Link href="/attendance/reports" className={cn(buttonVariants({ variant: "outline" }))}>
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            )}
          </div>
        }
      />

      {canPunch && <PunchPanel />}

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {canDashboard && !isEmployee && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {canDashboard && !isEmployee && (
          <TabsContent value="dashboard" className="mt-4">
            {dashboard}
          </TabsContent>
        )}

        <TabsContent value="calendar" className="mt-4">
          <AttendanceCalendar />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <AttendanceHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
