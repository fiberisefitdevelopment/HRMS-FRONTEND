"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types/leave";
import { getLeaveDisplayStatus, getLeaveDisplayStatusLabel } from "@/lib/leave/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

interface LeaveStatusBadgeProps {
  status?: string | null;
  leave?: Pick<LeaveRequest, "status" | "currentApprovalStage" | "approvals">;
  className?: string;
}

export function LeaveStatusBadge({ status, leave, className }: LeaveStatusBadgeProps) {
  const key = leave ? getLeaveDisplayStatus(leave) : (status ?? "pending").toLowerCase();
  const label = getLeaveDisplayStatusLabel(key);

  return (
    <Badge variant="outline" className={cn("border-0", STATUS_STYLES[key] ?? STATUS_STYLES.pending, className)}>
      {label}
    </Badge>
  );
}
