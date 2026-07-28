"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeForm } from "@/features/employees/employee-form";
import { toUpdateEmployeePayload } from "@/features/employees/employee-payload";
import { useEmployeeQuery } from "@/hooks/queries/use-employees-queries";
import { useUpdateEmployeeMutation } from "@/hooks/mutations/use-employee-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import type { CreateEmployeeFormValues } from "@/lib/validations/organization";

function EditEmployeeContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: employee, isLoading, isError, error } = useEmployeeQuery(id);
  const updateMutation = useUpdateEmployeeMutation();

  const handleSubmit = (values: CreateEmployeeFormValues) => {
    updateMutation.mutate(
      { id, payload: toUpdateEmployeePayload(values) },
      { onSuccess: () => router.push(`/employees/${id}`) }
    );
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${employee?.fullName ?? "Employee"}`}
        description="Update employee information"
      />
      <EmployeeForm
        employee={employee}
        isLoading={updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <PermissionGuard permissions={["employee.update"]}>
      <EditEmployeeContent id={id} />
    </PermissionGuard>
  );
}
