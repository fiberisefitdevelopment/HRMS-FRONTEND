"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompOffStatusBadge } from "./comp-off-status-badge";
import { formatLeaveDate } from "@/lib/leave/format";
import type { CompOffRequest } from "@/types/comp-off";

function formatOt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface CompOffDetailDialogProps {
  request: CompOffRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompOffDetailDialog({ request, open, onOpenChange }: CompOffDetailDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Comp-off Request
            <CompOffStatusBadge status={request.status} />
          </DialogTitle>
        </DialogHeader>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Employee</dt>
            <dd className="text-right">
              {request.user?.fullName ?? request.employee?.employeeId ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Attendance date</dt>
            <dd>{formatLeaveDate(request.attendanceDate)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Overtime</dt>
            <dd>{formatOt(request.overtimeMinutes)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Requested days</dt>
            <dd>{request.requestedDays}</dd>
          </div>
          {request.punchOutAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Punch out</dt>
              <dd>{new Date(request.punchOutAt).toLocaleString()}</dd>
            </div>
          )}
          {request.shiftEndTime && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shift end</dt>
              <dd>{new Date(request.shiftEndTime).toLocaleString()}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="mt-1">{request.reason}</dd>
          </div>
          {request.rejectedReason && (
            <div>
              <dt className="text-muted-foreground">Rejection reason</dt>
              <dd className="mt-1">{request.rejectedReason}</dd>
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
