"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/guards/permission-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { DesignationFormDialog } from "./designation-form-dialog";
import { useDesignationsQuery } from "@/hooks/queries/use-designations-queries";
import {
  useCreateDesignationMutation,
  useDeleteDesignationMutation,
  useUpdateDesignationMutation,
} from "@/hooks/mutations/use-designation-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { getErrorMessage } from "@/services/api/error-handler";
import type { Designation } from "@/types/designation";
import type { DesignationFormValues } from "@/lib/validations/organization";

export function DesignationsPage() {
  const { page, pageSize, search, setPage, onSearchChange } = useServerListState();
  const { data, isLoading, isError, error } = useDesignationsQuery({ page, limit: pageSize, search });
  const createMutation = useCreateDesignationMutation();
  const updateMutation = useUpdateDesignationMutation();
  const deleteMutation = useDeleteDesignationMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Designation | null>(null);

  const columns = useMemo<ColumnDef<Designation>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => row.original.level ?? "—",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const designation = row.original;
          return (
            <Can permissions={["designation.update", "designation.delete"]}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Can permission="designation.update">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(designation);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Can>
                  <Can permission="designation.delete">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget(designation)}
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
    []
  );

  const handleSubmit = (values: DesignationFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        { onSuccess: () => { setFormOpen(false); setEditing(null); } }
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Designations"
        description="Manage job titles and levels"
        actions={
          <Can permission="designation.create">
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Designation
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
        searchPlaceholder="Search designations..."
        getRowId={(row) => row.id}
        emptyMessage="No designations found"
      />

      <DesignationFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        designation={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete designation"
        description={`Delete ${deleteTarget?.name}?`}
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
