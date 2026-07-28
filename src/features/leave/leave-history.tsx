"use client";

import { useMemo, useState } from "react";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { LeaveFilters } from "./leave-filters";
import { getLeaveColumns } from "./leave-columns";
import { LeaveDetailDialog } from "./leave-detail-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useLeaveListQuery } from "@/hooks/queries/use-leave-queries";
import { useCancelLeaveMutation } from "@/hooks/mutations/use-leave-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage } from "@/services/api/error-handler";
import { formatLeaveDate } from "@/lib/leave/format";
import type { LeaveListParams, LeaveRequest, LeaveScope } from "@/types/leave";

interface LeaveHistoryProps {
  /** Personal leave history for managers/employees; team-scoped for manager team view */
  scope?: LeaveScope;
}

export function LeaveHistory({ scope }: LeaveHistoryProps = {}) {
  const { page, pageSize, setPage } = useServerListState(20);
  const [filters, setFilters] = useState<LeaveListParams>({});
  const [showFilters, setShowFilters] = useState(true);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const { hasRole } = usePermissions();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const cancelMutation = useCancelLeaveMutation();

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt",
      ...(scope && scope !== "company" ? { scope } : {}),
      ...filters,
    }),
    [page, pageSize, filters, scope]
  );

  const { data, isLoading, isError, error } = useLeaveListQuery(queryParams);

  const columns = useMemo(
    () =>
      getLeaveColumns({
        onView: setSelected,
        onCancel: setCancelTarget,
        showEmployee: hasRole(["hr", "owner", "manager"]),
        currentUserId,
      }),
    [hasRole, currentUserId]
  );

  return (
    <div className="space-y-4">
      {showFilters && (
        <LeaveFilters
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          onReset={() => {
            setFilters({});
            setPage(1);
          }}
        />
      )}

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
        enableSearch={false}
        getRowId={(row) => row.id}
        emptyMessage="No leave requests found"
        toolbar={
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        }
      />

      <LeaveDetailDialog
        leave={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        canApprove={false}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel leave request?"
        description={
          cancelTarget
            ? `Cancel ${cancelTarget.leaveTypeCode ?? cancelTarget.leaveType} leave for ${formatLeaveDate(cancelTarget.startDate)} – ${formatLeaveDate(cancelTarget.endDate)}?`
            : undefined
        }
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
