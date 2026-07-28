"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { LeaveRequest } from "@/types/leave";
import { LeaveStatusBadge } from "./leave-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  formatApprovalStage,
  formatLeaveDate,
  formatLeaveDays,
  getEmployeeDisplayName,
} from "@/lib/leave/format";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/guards/permission-guard";

export function getLeaveColumns(options?: {
  onView?: (row: LeaveRequest) => void;
  onApprove?: (row: LeaveRequest) => void;
  onCancel?: (row: LeaveRequest) => void;
  showEmployee?: boolean;
  canApprove?: boolean;
  currentUserId?: string;
}): ColumnDef<LeaveRequest>[] {
  const cols: ColumnDef<LeaveRequest>[] = [];

  if (options?.showEmployee) {
    cols.push({
      id: "employee",
      header: "Employee",
      cell: ({ row }) => getEmployeeDisplayName(row.original),
    });
  }

  cols.push(
    {
      accessorKey: "leaveTypeCode",
      header: "Type",
      cell: ({ row }) => row.original.leaveTypeCode ?? row.original.leaveType,
    },
    {
      accessorKey: "startDate",
      header: "Start",
      cell: ({ row }) => formatLeaveDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "End",
      cell: ({ row }) => formatLeaveDate(row.original.endDate),
    },
    {
      accessorKey: "totalDays",
      header: "Days",
      cell: ({ row }) => formatLeaveDays(row.original.totalDays),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <LeaveStatusBadge leave={row.original} />
          {row.original.source === "manual_hr" && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              Added by HR
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      cell: ({ row }) => (
        <span className="text-sm capitalize text-muted-foreground">
          {formatApprovalStage(row.original)}
        </span>
      ),
    },
    {
      accessorKey: "appliedOn",
      header: "Applied",
      cell: ({ row }) => formatLeaveDate(row.original.appliedOn ?? row.original.createdAt),
    }
  );

  if (options?.onView || options?.onApprove || options?.onCancel) {
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const leave = row.original;
        const showApprove =
          Boolean(options.canApprove) && leave.status === "pending" && Boolean(options.onApprove);
        const isOwn =
          Boolean(options.currentUserId) &&
          Boolean(leave.userId) &&
          String(leave.userId) === String(options.currentUserId);
        const showCancel =
          leave.status === "pending" && isOwn && Boolean(options.onCancel);

        return (
          <div className="flex items-center gap-1">
            {options.onView && (
              <Button variant="ghost" size="sm" onClick={() => options.onView?.(leave)}>
                View
              </Button>
            )}
            <Can permission="leave.cancel">
              {showCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => options.onCancel?.(leave)}
                >
                  Cancel
                </Button>
              )}
            </Can>
            <Can permission="leave.approve">
              {showApprove && (
                <Button size="sm" onClick={() => options.onApprove?.(leave)}>
                  Approve
                </Button>
              )}
            </Can>
          </div>
        );
      },
    });
  }

  return cols;
}
