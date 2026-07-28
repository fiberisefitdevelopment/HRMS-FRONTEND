"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { RegularizationStatusBadge } from "./regularization-status-badge";
import { RegularizationDetailDialog } from "./regularization-detail-dialog";
import { useRegularizationListQuery } from "@/hooks/queries/use-regularization-queries";
import { useCancelRegularizationMutation } from "@/hooks/mutations/use-regularization-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import {
  formatAppliedStatus,
  formatLateBy,
  formatRequestDate,
  formatStatusLabel,
  getApproverDisplayName,
  getRegularizationEmployeeName,
} from "@/lib/regularization/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type {
  RegularizationRequest,
  RegularizationScope,
  RegularizationStatus,
} from "@/types/regularization";
import { Badge } from "@/components/ui/badge";

const STATUS_TABS: Array<{ value: "all" | RegularizationStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

interface RegularizationHistoryProps {
  scope?: RegularizationScope;
  showEmployee?: boolean;
  canApprove?: boolean;
}

export function RegularizationHistory({
  scope,
  showEmployee,
  canApprove = false,
}: RegularizationHistoryProps) {
  const { page, pageSize, setPage } = useServerListState(20);
  const { hasPermission, hasRole } = usePermissions();
  const canCancel = hasPermission("regularization.cancel");
  const isHrOrOwner = hasRole(["hr", "owner"]);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [statusTab, setStatusTab] = useState<"all" | RegularizationStatus>("all");
  const [selected, setSelected] = useState<RegularizationRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RegularizationRequest | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt",
      ...(scope ? { scope } : {}),
      ...(statusTab !== "all" ? { status: statusTab } : {}),
    }),
    [page, pageSize, scope, statusTab]
  );

  const { data, isLoading, isError, error } = useRegularizationListQuery(params);
  const cancelMutation = useCancelRegularizationMutation();

  const columns = useMemo<ColumnDef<RegularizationRequest>[]>(() => {
    const cols: ColumnDef<RegularizationRequest>[] = [];
    if (showEmployee || hasRole(["hr", "owner", "manager"])) {
      cols.push({
        id: "employee",
        header: "Employee",
        cell: ({ row }) => getRegularizationEmployeeName(row.original),
      });
    }
    cols.push(
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatRequestDate(row.original),
      },
      {
        accessorKey: "originalStatus",
        header: "Original",
        cell: ({ row }) => (
          <span className="capitalize">{formatStatusLabel(row.original.originalStatus)}</span>
        ),
      },
      {
        accessorKey: "lateByMinutes",
        header: "Late by",
        cell: ({ row }) => formatLateBy(row.original.lateByMinutes),
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <RegularizationStatusBadge status={row.original.status} />,
      },
      {
        id: "appliedStatus",
        header: "Applied",
        cell: ({ row }) => {
          const applied = formatAppliedStatus(row.original.appliedStatus);
          if (!applied) return "—";
          return (
            <Badge
              variant={applied === "regularized" ? "success" : "warning"}
              className="capitalize"
            >
              {applied}
            </Badge>
          );
        },
      },
      {
        id: "approver",
        header: "Approver",
        cell: ({ row }) => {
          const status = String(row.original.status ?? "").toLowerCase();
          if (status !== "approved" && status !== "rejected") return "—";
          return getApproverDisplayName(row.original);
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          const isOwn =
            Boolean(currentUserId) &&
            Boolean(item.userId) &&
            String(item.userId) === String(currentUserId);
          const allowCancel = canCancel && item.status === "pending" && (isOwn || isHrOrOwner);
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setSelected(item)}>
                View
              </Button>
              {allowCancel && (
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
  }, [canCancel, currentUserId, hasRole, isHrOrOwner, showEmployee]);

  return (
    <div className="space-y-4">
      <Tabs
        value={statusTab}
        onValueChange={(value) => {
          setStatusTab(value as "all" | RegularizationStatus);
          setPage(1);
        }}
      >
        <TabsList className="h-auto flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
        emptyMessage="No regularization requests yet"
        enableSearch={false}
      />

      <RegularizationDetailDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        canApprove={canApprove}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel regularization?"
        description={`Cancel request for ${formatRequestDate(cancelTarget)}?`}
        confirmLabel="Cancel request"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelTarget) return;
          cancelMutation.mutate(
            { id: cancelTarget.id, payload: { reason: "Raised by mistake" } },
            { onSuccess: () => setCancelTarget(null) }
          );
        }}
      />
    </div>
  );
}
