"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { CompOffStatusBadge } from "./comp-off-status-badge";
import { CompOffDetailDialog } from "./comp-off-detail-dialog";
import { useCompOffListQuery } from "@/hooks/queries/use-comp-off-queries";
import { useCancelCompOffMutation } from "@/hooks/mutations/use-comp-off-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { formatLeaveDate } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { CompOffRequest, CompOffScope } from "@/types/comp-off";

function formatOt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface CompOffHistoryProps {
  scope?: CompOffScope;
  showEmployee?: boolean;
}

export function CompOffHistory({ scope, showEmployee }: CompOffHistoryProps) {
  const { page, pageSize, setPage } = useServerListState(20);
  const { hasPermission, hasRole } = usePermissions();
  const canCancel = hasPermission("comp_off.cancel");
  const [selected, setSelected] = useState<CompOffRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CompOffRequest | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt",
      ...(scope ? { scope } : {}),
    }),
    [page, pageSize, scope]
  );

  const { data, isLoading, isError, error } = useCompOffListQuery(params);
  const cancelMutation = useCancelCompOffMutation();

  const columns = useMemo<ColumnDef<CompOffRequest>[]>(() => {
    const cols: ColumnDef<CompOffRequest>[] = [];
    if (showEmployee || hasRole(["hr", "owner", "manager"])) {
      cols.push({
        id: "employee",
        header: "Employee",
        cell: ({ row }) =>
          row.original.user?.fullName ??
          row.original.employee?.employeeId ??
          "—",
      });
    }
    cols.push(
      {
        accessorKey: "attendanceDate",
        header: "Date",
        cell: ({ row }) => formatLeaveDate(row.original.attendanceDate),
      },
      {
        accessorKey: "overtimeMinutes",
        header: "OT",
        cell: ({ row }) => formatOt(row.original.overtimeMinutes),
      },
      {
        accessorKey: "requestedDays",
        header: "Days",
        cell: ({ row }) => row.original.requestedDays,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <CompOffStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[200px] text-sm text-muted-foreground">
            {row.original.reason}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setSelected(item)}>
                View
              </Button>
              {canCancel && item.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setCancelTarget(item)}
                >
                  Cancel
                </Button>
              )}
            </div>
          );
        },
      }
    );
    return cols;
  }, [canCancel, hasRole, showEmployee]);

  return (
    <div className="space-y-4">
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
        getRowId={(row) => row.id}
        emptyMessage="No comp-off requests yet"
        enableSearch={false}
      />

      <CompOffDetailDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel comp-off request?"
        description={`Cancel request for ${formatLeaveDate(cancelTarget?.attendanceDate)} (${cancelTarget?.requestedDays} day)?`}
        confirmLabel="Cancel request"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelTarget) return;
          cancelMutation.mutate(
            { id: cancelTarget.id },
            { onSuccess: () => setCancelTarget(null) }
          );
        }}
      />
    </div>
  );
}
