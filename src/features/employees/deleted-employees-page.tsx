"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useServerListState } from "@/hooks/use-server-list-state";
import { useDeletedEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useRestoreEmployeeMutation } from "@/hooks/mutations/use-employee-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import { getMediaUrl } from "@/lib/api/media-url";
import type { DeletedEmployee } from "@/types/employee";

export function DeletedEmployeesPage() {
  const { page, pageSize, search, setPage, onSearchChange } = useServerListState(20);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useDeletedEmployeesQuery({
    page,
    limit: pageSize,
    search,
  });
  const restoreMutation = useRestoreEmployeeMutation();

  const columns = useMemo<ColumnDef<DeletedEmployee>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Employee",
        cell: ({ row }) => {
          const employee = row.original;
          const initials =
            `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "?";
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {employee.profilePhoto && (
                  <AvatarImage src={getMediaUrl(employee.profilePhoto)} alt={employee.fullName} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{employee.fullName}</p>
                <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
              </div>
            </div>
          );
        },
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
      { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department?.name ?? "—",
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => row.original.designation?.name ?? "—",
      },
      {
        accessorKey: "deletedAt",
        header: "Deleted",
        cell: ({ row }) =>
          row.original.deletedAt ? format(new Date(row.original.deletedAt), "dd MMM yyyy") : "—",
      },
      {
        id: "restore",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            isLoading={restoreMutation.isPending && restoringId === row.original.id}
            disabled={restoreMutation.isPending}
            onClick={() => {
              setRestoringId(row.original.id);
              restoreMutation.mutate(row.original.id);
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </Button>
        ),
      },
    ],
    [restoreMutation, restoringId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deleted Employees"
        description="Employees removed from the directory. Restore them to show them in the panel again. Their employee IDs stay reserved and are never assigned to a new person."
      />

      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search deleted employees..."
        getRowId={(row) => row.id}
        emptyMessage="No deleted employees"
      />
    </div>
  );
}
