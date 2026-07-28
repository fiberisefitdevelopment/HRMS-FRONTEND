"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Clock,
  FileText,
  Wallet,
  Package,
  TrendingUp,
  GitBranch,
  History,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { formatAttendanceDate, formatMinutes, formatPunchTime } from "@/lib/attendance/format";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import { LeaveStatusBadge } from "@/features/leave/leave-status-badge";
import { formatLeaveDate, formatLeaveDays } from "@/lib/leave/format";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/guards/permission-guard";
import { EmployeePhotoUpload } from "./employee-photo-upload";
import { EmployeeStatusBadge } from "./employee-status-badge";
import {
  useEmployeeAttendanceQuery,
  useEmployeeLeaveQuery,
  useEmployeeQuery,
  useEmployeeWorkflowQuery,
} from "@/hooks/queries/use-employees-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { getErrorMessage } from "@/services/api/error-handler";

interface EmployeeProfileViewProps {
  employeeId: string;
}

interface WorkspaceTab {
  value: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

const WORKSPACE_TABS: WorkspaceTab[] = [
  { value: "overview", label: "Overview", icon: Briefcase },
  { value: "personal", label: "Personal", icon: FileText },
  { value: "employment", label: "Employment", icon: Briefcase },
  { value: "attendance", label: "Attendance", icon: Clock, permission: "attendance.view" },
  { value: "leave", label: "Leave", icon: CalendarDays, permission: "leave.read" },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "payroll", label: "Payroll", icon: Wallet, permission: "payroll.read" },
  { value: "assets", label: "Assets", icon: Package },
  { value: "performance", label: "Performance", icon: TrendingUp },
  { value: "workflow", label: "Workflow", icon: GitBranch, permission: "workflow.instance.read" },
  { value: "timeline", label: "Timeline", icon: History },
  { value: "notes", label: "Notes", icon: StickyNote },
];

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value || "—"}</span>
    </div>
  );
}

function ContactChip({ icon: Icon, value }: { icon: LucideIcon; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}

function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <EmptyState icon={icon} title={title} description={description} className="py-12" />
  );
}

export function EmployeeProfileView({ employeeId }: EmployeeProfileViewProps) {
  const { hasRole, hasPermission } = usePermissions();
  const isManager = hasRole("manager");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const { data: employee, isLoading, isError, error } = useEmployeeQuery(employeeId);
  const { data: attendance } = useEmployeeAttendanceQuery(employeeId);
  const { data: leave } = useEmployeeLeaveQuery(employeeId);
  const { data: workflow } = useEmployeeWorkflowQuery(employee?.userId);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="The employee profile could not be loaded."
      />
    );
  }

  const initials = `${employee.firstName[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase();
  const visibleTabs = WORKSPACE_TABS.filter(
    (tab) => !tab.permission || hasPermission(tab.permission)
  );
  const pendingWorkflows =
    workflow?.data?.filter((instance) => instance.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Sticky identity header */}
      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <EmployeePhotoUpload
              employeeId={employee.id}
              fullName={employee.fullName}
              profilePhoto={employee.profilePhoto}
              initials={initials}
            />
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{employee.fullName}</h1>
                <EmployeeStatusBadge status={employee.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {[employee.designation?.name, employee.department?.name, employee.employeeId]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                <ContactChip icon={Mail} value={employee.email} />
                <ContactChip icon={Phone} value={employee.phone} />
                <ContactChip icon={MapPin} value={employee.workLocation} />
                {employee.manager?.fullName && (
                  <ContactChip icon={Briefcase} value={`Reports to ${employee.manager.fullName}`} />
                )}
                {employee.joiningDate && (
                  <ContactChip
                    icon={CalendarDays}
                    value={`Joined ${format(new Date(employee.joiningDate), "dd MMM yyyy")}`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href={isManager ? "/teams" : "/employees"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isManager ? "Back to team" : "Back"}
            </Link>
            <Can permission="employee.update">
              <Link
                href={`/employees/${employee.id}/edit`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Can>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Attendance records"
              value={attendance?.meta?.total ?? 0}
              icon={Clock}
            />
            <StatCard title="Leave requests" value={leave?.meta?.total ?? 0} icon={CalendarDays} />
            <StatCard title="Pending workflows" value={pendingWorkflows} icon={GitBranch} />
            <StatCard
              title="Employment"
              value={employee.employmentType?.replace("_", " ") ?? "—"}
              icon={Briefcase}
            />
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Key information</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Official Email" value={employee.officialEmail} />
              <DetailRow label="Department" value={employee.department?.name} />
              <DetailRow label="Designation" value={employee.designation?.name} />
              <DetailRow label="Manager" value={employee.manager?.fullName} />
              <DetailRow label="Office Location" value={employee.officeLocation} />
              <DetailRow label="Work Location" value={employee.workLocation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DetailRow label="Personal Email" value={employee.personalEmail} />
              <DetailRow label="Gender" value={employee.gender} />
              <DetailRow
                label="Date of Birth"
                value={
                  employee.dateOfBirth
                    ? format(new Date(employee.dateOfBirth), "dd MMM yyyy")
                    : undefined
                }
              />
              <DetailRow label="Marital Status" value={employee.maritalStatus} />
              <DetailRow label="Nationality" value={employee.nationality} />
              <DetailRow label="Blood Group" value={employee.bloodGroup} />
              <DetailRow label="Address" value={employee.address} />
              <DetailRow label="City" value={employee.city} />
              <DetailRow label="State" value={employee.state} />
              <DetailRow label="Country" value={employee.country} />
              <DetailRow label="Emergency Contact" value={employee.emergencyContactName} />
              <DetailRow label="Emergency Phone" value={employee.emergencyContactNumber} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DetailRow label="Employee ID" value={employee.employeeId} />
              <DetailRow
                label="Confirmation Date"
                value={
                  employee.confirmationDate
                    ? format(new Date(employee.confirmationDate), "dd MMM yyyy")
                    : undefined
                }
              />
              <DetailRow label="Bank Name" value={employee.bankName} />
              <DetailRow label="IFSC" value={employee.ifscCode} />
              <DetailRow label="UAN" value={employee.uan} />
              <DetailRow label="PF Number" value={employee.pfNumber} />
              <DetailRow label="ESI Number" value={employee.esiNumber} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Attendance History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Punch records and working hours for this employee
              </p>
            </CardHeader>
            <CardContent>
              {!attendance?.data?.length ? (
                <EmptyState title="No attendance records" description="No attendance data from the API." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Punch In</TableHead>
                      <TableHead>Punch Out</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.data.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatAttendanceDate(record.date)}</TableCell>
                        <TableCell>
                          <AttendanceStatusBadge status={record.attendanceStatus ?? record.status} />
                        </TableCell>
                        <TableCell>{formatPunchTime(record.punchIn)}</TableCell>
                        <TableCell>{formatPunchTime(record.punchOut)}</TableCell>
                        <TableCell>{formatMinutes(record.netWorkingMinutes ?? record.grossWorkingMinutes)}</TableCell>
                        <TableCell>{formatMinutes(record.lateByMinutes)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!leave?.data?.length ? (
                <EmptyState title="No leave records" description="No leave data from the API." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leave.data.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.leaveTypeCode ?? request.leaveType ?? "—"}</TableCell>
                        <TableCell>{formatLeaveDate(request.startDate)}</TableCell>
                        <TableCell>{formatLeaveDate(request.endDate)}</TableCell>
                        <TableCell>{formatLeaveDays(request.totalDays)}</TableCell>
                        <TableCell>
                          <LeaveStatusBadge status={request.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <ComingSoon
            icon={FileText}
            title="Documents"
            description="Employee documents, contracts and uploads will appear here once the documents service is enabled."
          />
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <ComingSoon
            icon={Wallet}
            title="Payroll"
            description="Payslips and salary structure will appear here once the payroll service is enabled."
          />
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <ComingSoon
            icon={Package}
            title="Assets"
            description="Assigned assets and asset requests will appear here in a future release."
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <ComingSoon
            icon={TrendingUp}
            title="Performance"
            description="Reviews, goals and feedback will appear here in a future release."
          />
        </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!workflow?.data?.length ? (
                <EmptyState title="No workflow history" description="No workflow instances from the API." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.data.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell>{instance.workflowType}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{instance.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {instance.createdAt
                            ? format(new Date(instance.createdAt), "dd MMM yyyy")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ComingSoon
            icon={History}
            title="Activity Timeline"
            description="A chronological activity feed for this employee will appear here once the audit service is enabled."
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <ComingSoon
            icon={StickyNote}
            title="Notes"
            description="Private HR notes about this employee will appear here in a future release."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
