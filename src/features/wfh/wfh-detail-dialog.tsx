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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WfhStatusBadge } from "./wfh-status-badge";
import {
  useApproveWfhMutation,
  useRejectWfhMutation,
} from "@/hooks/mutations/use-wfh-mutations";
import { useAuthStore } from "@/store/auth-store";
import { formatLeaveDate } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { WfhRequest } from "@/types/wfh";

function getWfhEmployeeName(request: WfhRequest): string {
  const fromUser =
    request.user?.fullName ??
    [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ");
  return fromUser || request.employee?.employeeId || "—";
}

interface WfhDetailDialogProps {
  request: WfhRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
}

export function WfhDetailDialog({
  request,
  open,
  onOpenChange,
  canApprove = false,
}: WfhDetailDialogProps) {
  const [comment, setComment] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const approveMutation = useApproveWfhMutation();
  const rejectMutation = useRejectWfhMutation();

  if (!request) return null;

  const isOwnRequest =
    Boolean(currentUserId) &&
    Boolean(request.userId) &&
    String(request.userId) === String(currentUserId);
  const isPending = request.status === "pending";
  const showApproveReject = isPending && canApprove && !isOwnRequest;

  const close = () => {
    setComment("");
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
            Work from home request
            <WfhStatusBadge status={request.status} />
          </DialogTitle>
        </DialogHeader>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Employee</dt>
            <dd className="text-right">
              {getWfhEmployeeName(request)}
              {request.employee?.employeeId ? ` (${request.employee.employeeId})` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatLeaveDate(request.date)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="mt-1">{request.reason?.trim() || "—"}</dd>
          </div>
          {request.approvedComment && (
            <div>
              <dt className="text-muted-foreground">Approval comment</dt>
              <dd className="mt-1">{request.approvedComment}</dd>
            </div>
          )}
          {request.rejectedReason && (
            <div>
              <dt className="text-muted-foreground">Rejection reason</dt>
              <dd className="mt-1">{request.rejectedReason}</dd>
            </div>
          )}
        </dl>

        {showApproveReject && (
          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setRejectError(null);
              }}
              rows={2}
              placeholder="Optional note for approve / reject"
            />
            {rejectError && (
              <Alert variant="destructive">
                <AlertDescription>{rejectError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={close}>
            Close
          </Button>
          {showApproveReject && (
            <>
              <Button
                type="button"
                variant="destructive"
                isLoading={rejectMutation.isPending}
                onClick={() => {
                  rejectMutation.mutate(
                    { id: request.id, payload: { comment: comment || undefined } },
                    {
                      onSuccess: close,
                      onError: (error) => setRejectError(getErrorMessage(error)),
                    }
                  );
                }}
              >
                Reject
              </Button>
              <Button
                type="button"
                isLoading={approveMutation.isPending}
                onClick={() => {
                  approveMutation.mutate(
                    { id: request.id, payload: { comment: comment || undefined } },
                    { onSuccess: close }
                  );
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
