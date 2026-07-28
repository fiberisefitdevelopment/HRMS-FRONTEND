"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Can } from "@/components/guards/permission-guard";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import type { LeaveRequest } from "@/types/leave";
import { LeaveStatusBadge } from "./leave-status-badge";
import { ApprovalTimeline } from "./approval-timeline";
import { Badge } from "@/components/ui/badge";
import {
  formatApprovalStage,
  formatLeaveDate,
  formatLeaveDays,
  getActorDisplayName,
  getEmployeeDisplayName,
} from "@/lib/leave/format";
import {
  useApproveLeaveMutation,
  useCancelLeaveMutation,
  useRejectLeaveMutation,
} from "@/hooks/mutations/use-leave-mutations";
import { useAuthStore } from "@/store/auth-store";
import { getMediaUrl } from "@/lib/api/media-url";
import { ExternalLink, FileText } from "lucide-react";

interface LeaveDetailDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
}

export function LeaveDetailDialog({
  leave,
  open,
  onOpenChange,
  canApprove = false,
}: LeaveDetailDialogProps) {
  const [comment, setComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelMutation = useCancelLeaveMutation();
  const approveMutation = useApproveLeaveMutation();
  const rejectMutation = useRejectLeaveMutation();
  const currentUserId = useAuthStore((s) => s.user?.id);

  if (!leave) return null;

  const isOwnLeave =
    Boolean(currentUserId) &&
    Boolean(leave.userId) &&
    String(leave.userId) === String(currentUserId);
  const showCancel = leave.status === "pending" && isOwnLeave;
  const showApproveReject = leave.status === "pending" && canApprove && !isOwnLeave;

  const prescriptionUrl =
    leave.prescription ||
    (Array.isArray(leave.attachments) && leave.attachments.length > 0
      ? leave.attachments[0]
      : null);
  const prescriptionHref = getMediaUrl(prescriptionUrl);
  const isImage =
    !!prescriptionUrl && /\.(jpe?g|png|gif|webp)$/i.test(prescriptionUrl.split("?")[0] ?? "");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              Leave Request
              <LeaveStatusBadge leave={leave} />
              {leave.source === "manual_hr" && (
                <Badge variant="secondary" className="font-normal">
                  Added by HR
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Employee</dt>
              <dd className="text-right">{getEmployeeDisplayName(leave)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Type</dt>
              <dd>{leave.leaveTypeCode ?? leave.leaveType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dates</dt>
              <dd>
                {formatLeaveDate(leave.startDate)} – {formatLeaveDate(leave.endDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Days</dt>
              <dd>{formatLeaveDays(leave.totalDays)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Approval</dt>
              <dd className="text-right capitalize">{formatApprovalStage(leave)}</dd>
            </div>
            {leave.approvedBy && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Approved by</dt>
                <dd className="text-right">{getActorDisplayName(leave.approvedBy)}</dd>
              </div>
            )}
            {leave.rejectedBy && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rejected by</dt>
                <dd className="text-right">{getActorDisplayName(leave.rejectedBy)}</dd>
              </div>
            )}
            {leave.reason && (
              <div>
                <dt className="text-muted-foreground">Reason</dt>
                <dd className="mt-1">{leave.reason}</dd>
              </div>
            )}
            {prescriptionHref && (
              <div>
                <dt className="text-muted-foreground">Prescription</dt>
                <dd className="mt-2 space-y-2">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prescriptionHref}
                      alt="Prescription"
                      className="max-h-40 rounded border object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Attached document</span>
                    </div>
                  )}
                  <a
                    href={prescriptionHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open prescription
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Approval Timeline</h4>
            <ApprovalTimeline
              workflowInstanceId={leave.workflowInstanceId}
              approvals={leave.approvals}
            />
          </div>

          <Can permission="leave.cancel">
            {showCancel && (
              <div className="space-y-2 border-t pt-4">
                <Label>Cancel reason (optional)</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  placeholder="Optional reason for cancelling"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel Leave
                </Button>
              </div>
            )}
          </Can>

          <Can permission="leave.approve">
            {showApproveReject && (
              <div className="space-y-2 border-t pt-4">
                <Label>Approval comment</Label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    isLoading={approveMutation.isPending}
                    onClick={() =>
                      approveMutation.mutate(
                        { id: leave.id, payload: { comment: comment || undefined } },
                        { onSuccess: () => onOpenChange(false) }
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    isLoading={rejectMutation.isPending}
                    onClick={() =>
                      rejectMutation.mutate(
                        { id: leave.id, payload: { comment: comment || undefined } },
                        { onSuccess: () => onOpenChange(false) }
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </Can>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel leave request?"
        description={`Cancel ${leave.leaveTypeCode ?? leave.leaveType} leave for ${formatLeaveDate(leave.startDate)} – ${formatLeaveDate(leave.endDate)}?`}
        confirmLabel="Cancel request"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          cancelMutation.mutate(
            {
              id: leave.id,
              payload: cancelReason.trim() ? { reason: cancelReason.trim() } : undefined,
            },
            {
              onSuccess: () => {
                setConfirmCancel(false);
                onOpenChange(false);
              },
            }
          );
        }}
      />
    </>
  );
}
