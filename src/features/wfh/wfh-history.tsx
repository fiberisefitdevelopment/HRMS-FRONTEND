"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WfhStatusBadge } from "./wfh-status-badge";
import { useWfhListQuery } from "@/hooks/queries/use-wfh-queries";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { formatLeaveDate } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { WfhRequest, WfhScope } from "@/types/wfh";

function displayName(req: WfhRequest) {
  return (
    req.user?.fullName ||
    [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
    req.employee?.employeeId ||
    "—"
  );
}

interface WfhHistoryProps {
  scope?: WfhScope;
  showEmployee?: boolean;
}

export function WfhHistory({ scope, showEmployee }: WfhHistoryProps) {
  const { page, pageSize, setPage } = useServerListState(20);
  const { hasRole } = usePermissions();
  const [selected, setSelected] = useState<WfhRequest | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt",
      ...(scope ? { scope } : {}),
    }),
    [page, pageSize, scope]
  );

  const { data, isLoading, isError, error } = useWfhListQuery(params);

  const columns = useMemo<ColumnDef<WfhRequest>[]>(() => {
    const cols: ColumnDef<WfhRequest>[] = [];
    if (showEmployee || hasRole(["hr", "owner", "manager"])) {
      cols.push({
        id: "employee",
        header: "Employee",
        cell: ({ row }) => displayName(row.original),
      });
    }
    cols.push(
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => formatLeaveDate(row.original.date),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <WfhStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px] text-sm text-muted-foreground">
            {row.original.reason || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>
            View
          </Button>
        ),
      }
    );
    return cols;
  }, [hasRole, showEmployee]);

  return (
    <div className="space-y-4">
      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        onPageChange={setPage}
        enableSearch={false}
        emptyMessage="No work-from-home requests yet"
        getRowId={(row) => row.id}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Work From Home
              {selected && <WfhStatusBadge status={selected.status} />}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Employee</dt>
                <dd>{displayName(selected)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd>{formatLeaveDate(selected.date)}</dd>
              </div>
              {selected.reason && (
                <div>
                  <dt className="text-muted-foreground">Reason</dt>
                  <dd className="mt-1">{selected.reason}</dd>
                </div>
              )}
              {selected.approvedAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Approved at</dt>
                  <dd>{formatLeaveDate(selected.approvedAt)}</dd>
                </div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
