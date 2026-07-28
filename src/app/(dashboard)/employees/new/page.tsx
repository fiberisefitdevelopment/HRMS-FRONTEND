"use client";

import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeForm } from "@/features/employees/employee-form";
import { toCreateEmployeePayload } from "@/features/employees/employee-payload";
import { useCreateEmployeeMutation } from "@/hooks/mutations/use-employee-mutations";
import type { CreateEmployeeFormValues } from "@/lib/validations/organization";

function NewEmployeeContent() {
  const router = useRouter();
  const createMutation = useCreateEmployeeMutation();

  const handleSubmit = (values: CreateEmployeeFormValues) => {
    createMutation.mutate(toCreateEmployeePayload(values), {
      onSuccess: (data) => router.push(`/employees/${data.id}`),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add Employee" description="Create a new employee profile" />
      <EmployeeForm isLoading={createMutation.isPending} onSubmit={handleSubmit} />
    </div>
  );
}

export default function NewEmployeePage() {
  return (
    <PermissionGuard permissions={["employee.create"]}>
      <NewEmployeeContent />
    </PermissionGuard>
  );
}
