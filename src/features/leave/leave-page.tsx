"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Can } from "@/components/guards/permission-guard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { LeaveBalancePanel } from "./leave-balance-panel";
import { ApplyLeaveForm } from "./apply-leave-form";
import { HrAddLeaveForm } from "./hr-add-leave-form";
import { LeaveHistory } from "./leave-history";
import { LeaveCalendar } from "./leave-calendar";
import { RegularizationHistory } from "@/features/regularization/regularization-history";
import { EmployeeLeaveDashboard } from "./dashboards/employee-dashboard";
import { HrLeaveDashboard } from "./dashboards/hr-dashboard";
import { OwnerLeaveDashboard } from "./dashboards/owner-dashboard";
import { usePermissions } from "@/hooks/use-permissions";

export function LeavePage() {
  const searchParams = useSearchParams();
  const { hasPermission, hasRole } = usePermissions();
  const canCreate = hasPermission("leave.create");
  const canBalance = hasPermission("leave.balance.read");
  const canCalendar = hasPermission("leave.calendar.read");
  const canReport = hasPermission("leave.report");
  const canApprove = hasPermission("leave.approve");
  const canReadRegularization = hasPermission("regularization.read");

  const isEmployee = hasRole("employee");
  const isManager = hasRole("manager");
  const isHrOrOwner = hasRole(["hr", "owner"]);
  const canHrAddLeave = isHrOrOwner && hasPermission("leave.policy.manage");

  // Managers use /teams/leave for team data; /leave is personal (My Leave) only.
  // Approvals live only on /approvals — not on this page.
  const showBalancePanel = canBalance && (isEmployee || isManager);
  const showDashboardTab = !isEmployee && !isManager;

  const defaultTab =
    searchParams.get("tab") === "history"
      ? "history"
      : isManager
        ? canCreate
          ? "apply"
          : "history"
        : isEmployee
          ? canCreate
            ? "apply"
            : "history"
          : canHrAddLeave
            ? "add-leave"
            : "dashboard";

  const dashboard = useMemo(() => {
    if (hasRole("owner")) return <OwnerLeaveDashboard />;
    if (hasRole("hr")) return <HrLeaveDashboard />;
    return <EmployeeLeaveDashboard scope="self" />;
  }, [hasRole]);

  const calendarScope = isHrOrOwner ? "company" : "self";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isManager ? "My Leave" : "Leave"}
        description={
          isManager
            ? "Your leave balance, requests, and calendar"
            : isEmployee
              ? "Apply for leave and track your requests"
              : "Manage leave requests, balances, and calendar"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Can permissions={["comp_off.read", "comp_off.create"]}>
              <Link
                href={ROUTES.leaveCompOff}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Timer className="mr-2 h-4 w-4" />
                Comp-off
              </Link>
            </Can>
            {canApprove && (
              <Link href={ROUTES.approvals} className={cn(buttonVariants({ variant: "outline" }))}>
                Approvals
              </Link>
            )}
            {isManager && (
              <Link href="/teams/leave" className={cn(buttonVariants({ variant: "outline" }))}>
                Team leave
              </Link>
            )}
            {canReport && (
              <Link href="/leave/reports" className={cn(buttonVariants({ variant: "outline" }))}>
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            )}
          </div>
        }
      />

      {showBalancePanel && <LeaveBalancePanel />}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap h-auto">
          {showDashboardTab && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
          {canHrAddLeave && <TabsTrigger value="add-leave">Add Leave Balance</TabsTrigger>}
          {canCreate && !isHrOrOwner && <TabsTrigger value="apply">Apply Leave</TabsTrigger>}
          {canCreate && isHrOrOwner && <TabsTrigger value="apply">Apply for Self</TabsTrigger>}
          <TabsTrigger value="history">History</TabsTrigger>
          {canCalendar && <TabsTrigger value="calendar">Calendar</TabsTrigger>}
        </TabsList>

        {showDashboardTab && (
          <TabsContent value="dashboard" className="mt-4">
            {dashboard}
          </TabsContent>
        )}

        {canHrAddLeave && (
          <TabsContent value="add-leave" className="mt-4">
            <HrAddLeaveForm />
          </TabsContent>
        )}

        <Can permission="leave.create">
          <TabsContent value="apply" className="mt-4">
            <ApplyLeaveForm />
          </TabsContent>
        </Can>

        <TabsContent value="history" className="mt-4 space-y-8">
          <div className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight">Leave requests</h2>
            <LeaveHistory scope={isManager || isEmployee ? "self" : undefined} />
          </div>

          {canReadRegularization && (isEmployee || isManager) && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold tracking-tight">
                Regularization requests
              </h2>
              <p className="text-sm text-muted-foreground">
                Attendance regularization requests you raised. Raise new ones from the calendar when
                a day shows Regularize.
              </p>
              <RegularizationHistory scope="self" />
            </div>
          )}
        </TabsContent>

        {canCalendar && (
          <TabsContent value="calendar" className="mt-4">
            <LeaveCalendar scope={calendarScope} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
