"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Building2, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/guards/permission-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { CompanyFormDialog } from "./company-form-dialog";
import { useCompaniesQuery } from "@/hooks/queries/use-companies-queries";
import {
  useActivateCompanyMutation,
  useCreateCompanyMutation,
  useDeactivateCompanyMutation,
  useDeleteCompanyMutation,
  useUpdateCompanyMutation,
} from "@/hooks/mutations/use-company-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { getErrorMessage } from "@/services/api/error-handler";
import type { Company } from "@/types/company";
import type { CompanyFormValues } from "@/lib/validations/organization";

export function CompaniesPage() {
  const { page, pageSize, search, setPage, onSearchChange } = useServerListState();
  const { data, isLoading, isError, error } = useCompaniesQuery({ page, limit: pageSize, search });
  const createMutation = useCreateCompanyMutation();
  const updateMutation = useUpdateCompanyMutation();
  const deleteMutation = useDeleteCompanyMutation();
  const activateMutation = useActivateCompanyMutation();
  const deactivateMutation = useDeactivateCompanyMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{row.original.companyName}</p>
              <p className="text-xs text-muted-foreground">{row.original.companyCode}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "active" ? "success" : "secondary"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <Can permission="company.update">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Can permission="company.update">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(company);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Can>
                  <Can permission="company.update">
                    {company.status === "active" ? (
                      <DropdownMenuItem onClick={() => deactivateMutation.mutate(company.id)}>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => activateMutation.mutate(company.id)}>
                        <Power className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    )}
                  </Can>
                  <Can permission="company.delete">
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget(company)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </Can>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          );
        },
      },
    ],
    [activateMutation, deactivateMutation]
  );

  const handleSubmit = (values: CompanyFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        { onSuccess: () => { setFormOpen(false); setEditing(null); } }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage organizations in your HRMS"
        actions={
          <Can permission="company.create">
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Company
            </Button>
          </Can>
        }
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
        searchPlaceholder="Search companies..."
        getRowId={(row) => row.id}
        emptyMessage="No companies found"
      />

      <CompanyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        company={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete company"
        description={`Are you sure you want to delete ${deleteTarget?.companyName}? This action may be irreversible.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}
