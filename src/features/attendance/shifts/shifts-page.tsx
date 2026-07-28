"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { ShiftFormDialog } from "./shift-form-dialog";
import { useShiftsQuery } from "@/hooks/queries/use-shifts-queries";
import {
  useAssignShiftMutation,
  useCreateShiftMutation,
  useDeleteShiftMutation,
  useUpdateShiftMutation,
} from "@/hooks/mutations/use-shift-mutations";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useServerListState } from "@/hooks/use-server-list-state";
import { getErrorMessage } from "@/services/api/error-handler";
import type { Shift } from "@/types/shift";

export function ShiftsPage() {
  const { page, pageSize, setPage, onSearchChange } = useServerListState();
  const { data, isLoading, isError, error } = useShiftsQuery({ page, limit: pageSize });
  const { data: employeesData } = useEmployeesQuery({ page: 1, limit: 200, sort: "firstName", status: "active" });
  const createMutation = useCreateShiftMutation();
  const updateMutation = useUpdateShiftMutation();
  const deleteMutation = useDeleteShiftMutation();
  const assignMutation = useAssignShiftMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");

  const columns = useMemo<ColumnDef<Shift>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "code", header: "Code" },
      {
        id: "timing",
        header: "Timing",
        cell: ({ row }) => `${row.original.startTime} – ${row.original.endTime}`,
      },
      {
        accessorKey: "gracePeriodMinutes",
        header: "Grace (min)",
        cell: ({ row }) => row.original.gracePeriodMinutes ?? "—",
      },
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
          const shift = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(shift);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteTarget(shift)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Management"
        description="Manage work shifts and timings"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Shift
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assign Shift to Employee</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {(employeesData?.data ?? []).map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
            <SelectTrigger>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              {(data?.data ?? []).map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            disabled={!selectedEmployeeId || !selectedShiftId}
            isLoading={assignMutation.isPending}
            onClick={() => {
              const selectedEmployee = (employeesData?.data ?? []).find((employee) => employee.id === selectedEmployeeId);
              if (!selectedEmployee) return;
              assignMutation.mutate(
                {
                  employeeProfileId: selectedEmployee.id,
                  userId: selectedEmployee.userId,
                  shiftId: selectedShiftId,
                },
                {
                  onSuccess: () => {
                    setSelectedEmployeeId("");
                    setSelectedShiftId("");
                  },
                }
              );
            }}
          >
            Assign Shift
          </Button>
        </CardContent>
      </Card>

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
        searchPlaceholder="Search shifts..."
        getRowId={(row) => row.id}
        emptyMessage="No shifts found"
      />

      <ShiftFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        shift={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate(
              { id: editing.id, payload: values },
              { onSuccess: () => { setFormOpen(false); setEditing(null); } }
            );
          } else {
            createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete shift"
        description={`Delete shift ${deleteTarget?.name}?`}
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
