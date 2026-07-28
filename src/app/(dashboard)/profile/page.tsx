"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/badges/role-badge";
import { CompanyBadge } from "@/components/badges/company-badge";
import { PermissionBadge } from "@/components/badges/permission-badge";
import { EmployeeStatusBadge } from "@/features/employees/employee-status-badge";
import { EmployeePhotoUpload } from "@/features/employees/employee-photo-upload";
import { useSessionQuery } from "@/hooks/queries/use-auth-queries";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  formatEmploymentType,
  formatWorkingDays,
  getEmergencyContact,
  getEmployeeCompanyName,
  getEmployeeDateOfBirth,
  getEmployeeDepartmentName,
  getEmployeeDesignationName,
  getEmployeeManagerName,
} from "@/lib/employee/display";
import { getErrorMessage } from "@/services/api/error-handler";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value || "—"}</span>
    </div>
  );
}

function formatOptionalDate(value?: string | null) {
  if (!value) return undefined;
  return format(new Date(value), "dd MMM yyyy");
}

export default function ProfilePage() {
  const sessionQuery = useSessionQuery();
  const meQuery = useEmployeeMeQuery();

  const isLoading = sessionQuery.isLoading || meQuery.isLoading;
  const isError = sessionQuery.isError || meQuery.isError;
  const error = sessionQuery.error ?? meQuery.error;

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Profile" description="Your account information" />
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const user = sessionQuery.data?.user;
  const permissions = sessionQuery.data?.permissions ?? [];
  const employee = meQuery.data;

  if (!user || !employee) {
    return (
      <EmptyState
        icon={UserIcon}
        title="Profile unavailable"
        description="Unable to load your profile. Please try again."
        action={
          <button
            type="button"
            onClick={() => {
              void sessionQuery.refetch();
              void meQuery.refetch();
            }}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        }
      />
    );
  }

  const initials =
    `${employee.firstName?.[0] ?? user.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const photo = employee.profilePhoto ?? user.profilePhoto;
  const fullName = employee.fullName || user.fullName;
  const email = employee.officialEmail || employee.email || user.email;
  const department = getEmployeeDepartmentName(employee) ?? user.department;
  const designation = getEmployeeDesignationName(employee) ?? user.designation;
  const manager = getEmployeeManagerName(employee);
  const companyName = getEmployeeCompanyName(employee) ?? user.company?.name;
  const dateOfBirth = getEmployeeDateOfBirth(employee);
  const emergency = getEmergencyContact(employee);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Profile" description="Your employee and account information" />

      <motion.div variants={fadeInUp} className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <EmployeePhotoUpload
              mode="self"
              fullName={fullName}
              profilePhoto={photo}
              initials={initials}
            />
            <h2 className="mt-2 text-xl font-semibold">{fullName}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{email}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={user.role} />
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">ID: {employee.employeeId}</p>
            {designation && (
              <p className="mt-1 text-sm text-muted-foreground">{designation}</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Employment</CardTitle>
            <CardDescription>Role, team and work schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {companyName && (
              <div className="mb-3 flex items-center justify-between gap-4 border-b pb-3">
                <span className="text-sm text-muted-foreground">Company</span>
                <CompanyBadge name={companyName} logo={user.company?.logo} size="sm" />
              </div>
            )}
            <DetailRow label="Department" value={department} />
            <DetailRow label="Designation" value={designation} />
            <DetailRow label="Manager" value={manager} />
            <DetailRow label="Joining date" value={formatOptionalDate(employee.joiningDate)} />
            <DetailRow label="Employment type" value={formatEmploymentType(employee.employmentType)} />
            <DetailRow label="Work location" value={employee.workLocation} />
            <DetailRow label="Office location" value={employee.officeLocation} />
            <DetailRow label="Shift" value={employee.shiftTime} />
            <DetailRow label="Working days" value={formatWorkingDays(employee.workingDays)} />
            <div className="flex justify-between gap-4 py-2">
              <span className="text-sm text-muted-foreground">Geofencing</span>
              <Badge variant={employee.geofencing ? "success" : "secondary"}>
                {employee.geofencing ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal</CardTitle>
            <CardDescription>Contact and personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailRow label="Official email" value={employee.officialEmail || employee.email} />
            <DetailRow label="Personal email" value={employee.personalEmail} />
            <DetailRow label="Phone" value={employee.phone} />
            <DetailRow label="Alternate phone" value={employee.alternatePhone} />
            <DetailRow label="Gender" value={employee.gender} />
            <DetailRow label="Date of birth" value={formatOptionalDate(dateOfBirth)} />
            <DetailRow label="Marital status" value={employee.maritalStatus} />
            <DetailRow label="Nationality" value={employee.nationality} />
            <DetailRow label="Blood group" value={employee.bloodGroup} />
            <DetailRow label="Address" value={employee.address} />
            <DetailRow label="City" value={employee.city} />
            <DetailRow label="State" value={employee.state} />
            <DetailRow label="Country" value={employee.country} />
            <DetailRow label="Pincode" value={employee.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency contact</CardTitle>
            <CardDescription>Who to reach in case of emergency</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailRow label="Name" value={emergency.name} />
            <DetailRow label="Phone" value={emergency.number} />
            <DetailRow label="Relation" value={emergency.relation} />
          </CardContent>
        </Card>
      </motion.div>

      {permissions.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissions</CardTitle>
              <CardDescription>Your active permissions for the current company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <PermissionBadge key={permission} permission={permission} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
