"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Can } from "@/components/guards/permission-guard";
import { RegularizationStatusBadge } from "./regularization-status-badge";
import {
  useApproveRegularizationMutation,
  useCancelRegularizationMutation,
  useRejectRegularizationMutation,
} from "@/hooks/mutations/use-regularization-mutations";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import {
  formatAppliedStatus,
  formatLateBy,
  formatRegularizationPunchTime,
  formatRequestDate,
  formatStatusLabel,
  getApproverDisplayName,
  getRegularizationEmployeeName,
} from "@/lib/regularization/format";
import type { RegularizationRequest } from "@/types/regularization";

interface RegularizationDetailDialogProps {
  request: RegularizationRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
}

export function RegularizationDetailDialog({
  request,
  open,
  onOpenChange,
  canApprove = false,
}: RegularizationDetailDialogProps) {
  const [comment, setComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { hasRole } = usePermissions();
  const approveMutation = useApproveRegularizationMutation();
  const rejectMutation = useRejectRegularizationMutation();
  const cancelMutation = useCancelRegularizationMutation();

  if (!request) return null;

  const isOwnRequest =
    Boolean(currentUserId) &&
    Boolean(request.userId) &&
    String(request.userId) === String(currentUserId);
  const isPending = request.status === "pending";
  const showApproveReject = isPending && canApprove && !isOwnRequest;
  const showCancel = isPending && (isOwnRequest || hasRole(["hr", "owner"]));
  const appliedLabel = formatAppliedStatus(request.appliedStatus);

  const close = () => {
    setComment("");
    setCancelReason("");
    setRejectError(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Regularization request
            <RegularizationStatusBadge status={request.status} />
          </DialogTitle>
        </DialogHeader>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Employee</dt>
            <dd className="text-right">
              {getRegularizationEmployeeName(request)}
              {request.employee?.employeeId ? ` (${request.employee.employeeId})` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatRequestDate(request)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Punch in</dt>
            <dd>
              {formatRegularizationPunchTime(request.punchInAt, request.punchInDisplay)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Late by</dt>
            <dd>{formatLateBy(request.lateByMinutes)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Original status</dt>
            <dd className="capitalize">{formatStatusLabel(request.originalStatus)}</dd>
          </div>
          {(request.status === "approved" || request.status === "rejected") && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                {request.status === "rejected" ? "Rejected by" : "Approved by"}
              </dt>
              <dd className="text-right">{getApproverDisplayName(request)}</dd>
            </div>
          )}
          {request.approvedAt && request.status === "approved" && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Approved at</dt>
              <dd>{new Date(request.approvedAt).toLocaleString()}</dd>
            </div>
          )}
          {request.rejectedAt && request.status === "rejected" && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rejected at</dt>
              <dd>{new Date(request.rejectedAt).toLocaleString()}</dd>
            </div>
          )}
          {(request.windowDisplay || request.policy?.windowStart) && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Policy window</dt>
              <dd className="text-right">
                {request.windowDisplay ??
                  `${request.policy?.windowStart ?? ""} – ${request.policy?.windowEnd ?? ""}`}
              </dd>
            </div>
          )}
          {request.requestedPunchIn && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Requested punch in</dt>
              <dd>
                {new Date(request.requestedPunchIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          )}
          {request.requestedPunchOut && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Requested punch out</dt>
              <dd>
                {new Date(request.requestedPunchOut).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          )}
          {appliedLabel && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Applied status</dt>
              <dd>
                <Badge
                  variant={appliedLabel === "regularized" ? "success" : "warning"}
                  className="capitalize"
                >
                  {appliedLabel}
                </Badge>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="mt-1">{request.reason}</dd>
          </div>
          {(request.comment || request.rejectionComment) && (
            <div>
              <dt className="text-muted-foreground">Reviewer comment</dt>
              <dd className="mt-1">{request.comment ?? request.rejectionComment}</dd>
            </div>
          )}
          {request.cancelledReason && (
            <div>
              <dt className="text-muted-foreground">Cancel reason</dt>
              <dd className="mt-1">{request.cancelledReason}</dd>
            </div>
          )}
        </dl>

        {appliedLabel && appliedLabel !== "regularized" && request.status === "approved" && (
          <Alert>
            <AlertDescription>
              Approved, but attendance was set to <strong className="capitalize">{appliedLabel}</strong>{" "}
              (monthly limit exceeded or policy exceeding action).
            </AlertDescription>
          </Alert>
        )}

        {showApproveReject && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setRejectError(null);
                }}
                rows={2}
                placeholder="Optional for approve · required for reject"
              />
              {rejectError && <p className="text-xs text-destructive">{rejectError}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                isLoading={rejectMutation.isPending}
                disabled={approveMutation.isPending}
                onClick={() => {
                  if (!comment.trim()) {
                    setRejectError("Comment is required to reject");
                    return;
                  }
                  rejectMutation.mutate(
                    { id: request.id, payload: { comment: comment.trim() } },
                    { onSuccess: close }
                  );
                }}
              >
                Reject
              </Button>
              <Button
                isLoading={approveMutation.isPending}
                disabled={rejectMutation.isPending}
                onClick={() => {
                  approveMutation.mutate(
                    { id: request.id, payload: { comment: comment.trim() || undefined } },
                    { onSuccess: close }
                  );
                }}
              >
                Approve
              </Button>
            </DialogFooter>
          </div>
        )}

        {showCancel && (
          <Can permission="regularization.cancel">
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label>Cancel reason (optional)</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  placeholder="Raised by mistake"
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                isLoading={cancelMutation.isPending}
                onClick={() => {
                  cancelMutation.mutate(
                    {
                      id: request.id,
                      payload: cancelReason.trim()
                        ? { reason: cancelReason.trim() }
                        : undefined,
                    },
                    { onSuccess: close }
                  );
                }}
              >
                Cancel request
              </Button>
            </div>
          </Can>
        )}
      </DialogContent>
    </Dialog>
  );
}
