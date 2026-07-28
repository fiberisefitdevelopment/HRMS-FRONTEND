"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardList } from "lucide-react";
import { useWorkflowPendingQuery } from "@/hooks/queries/use-workflow-queries";
import {
  useCompOffDetailQuery,
  useCompOffListQuery,
} from "@/hooks/queries/use-comp-off-queries";
import {
  useApproveWorkflowMutation,
  useRejectWorkflowMutation,
} from "@/hooks/mutations/use-workflow-mutations";
import { CompOffStatusBadge } from "./comp-off-status-badge";
import { formatLeaveDate } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { CompOffRequest } from "@/types/comp-off";
import type { WorkflowInstance } from "@/types/workflow";

type QueueMode = "pending" | "approved";

interface CompOffApprovalQueueProps {
  mode?: QueueMode;
}

function getCompOffEmployeeName(request: CompOffRequest): string {
  return (
    request.user?.fullName ||
    [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ") ||
    request.employee?.employeeId ||
    "—"
  );
}

export function CompOffApprovalQueue({ mode = "pending" }: CompOffApprovalQueueProps) {
  const isApproved = mode === "approved";

  if (isApproved) {
    return <ApprovedCompOffQueue />;
  }

  return <PendingCompOffQueue />;
}

function ApprovedCompOffQueue() {
  const { data, isLoading, isError, error } = useCompOffListQuery({
    status: "approved",
    limit: 100,
    sort: "-createdAt",
  });
  const [selected, setSelected] = useState<CompOffRequest | null>(null);

  const queue = (data?.data ?? []).filter((item) => item.status === "approved");

  if (isLoading) return <Skeleton className="h-48" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!queue.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No approved comp-off"
        description="Approved comp-off requests will appear here."
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approved Comp-off ({queue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">
                  {getCompOffEmployeeName(item)}
                  {item.employee?.employeeId ? (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      ({item.employee.employeeId})
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatLeaveDate(item.attendanceDate)} · {item.requestedDays} day
                  {item.overtimeMinutes != null ? ` · OT ${item.overtimeMinutes}m` : ""}
                </p>
                {item.reason?.trim() ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.reason}</p>
                ) : null}
                <CompOffStatusBadge status={item.status} />
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelected(item)}>
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comp-off details</DialogTitle>
          </DialogHeader>
          {selected ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Employee</dt>
                <dd>{getCompOffEmployeeName(selected)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd>{formatLeaveDate(selected.attendanceDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">OT / Days</dt>
                <dd>
                  {selected.overtimeMinutes}m · {selected.requestedDays} day
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <CompOffStatusBadge status={selected.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reason</dt>
                <dd className="mt-1">{selected.reason || "—"}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PendingCompOffQueue() {
  const { data: pending, isLoading, isError, error } = useWorkflowPendingQuery();
  const [reviewing, setReviewing] = useState<WorkflowInstance | null>(null);
  const [comment, setComment] = useState("");

  const queue = useMemo(
    () => (pending ?? []).filter((w) => w.workflowType === "comp_off"),
    [pending]
  );

  const { data: detail } = useCompOffDetailQuery(reviewing?.entityId);
  const approveMutation = useApproveWorkflowMutation();
  const rejectMutation = useRejectWorkflowMutation();

  if (isLoading) return <Skeleton className="h-48" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!queue.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No pending comp-off approvals"
        description="Comp-off requests waiting for your approval will appear here."
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending Comp-off ({queue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => {
            const ctx = item.contextData ?? {};
            const days = ctx.requestedDays as number | undefined;
            const ot = ctx.overtimeMinutes as number | undefined;
            const date = ctx.attendanceDate as string | undefined;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">Comp-off request</p>
                  <p className="text-sm text-muted-foreground">
                    {date ? formatLeaveDate(date) : "—"}
                    {days != null ? ` · ${days} day` : ""}
                    {ot != null ? ` · OT ${ot}m` : ""}
                  </p>
                  <CompOffStatusBadge status={item.status} />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setReviewing(item);
                    setComment("");
                  }}
                >
                  Review & Approve
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(reviewing)}
        onOpenChange={(open) => {
          if (!open) setReviewing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Comp-off</DialogTitle>
          </DialogHeader>
          {detail ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Employee</dt>
                <dd>{detail.user?.fullName ?? detail.employee?.employeeId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd>{formatLeaveDate(detail.attendanceDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">OT / Days</dt>
                <dd>
                  {detail.overtimeMinutes}m · {detail.requestedDays} day
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reason</dt>
                <dd className="mt-1">{detail.reason}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Loading request details…</p>
          )}
          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              isLoading={rejectMutation.isPending}
              disabled={!reviewing}
              onClick={() => {
                if (!reviewing) return;
                rejectMutation.mutate(
                  { id: reviewing.id, payload: { comment: comment || undefined } },
                  { onSuccess: () => setReviewing(null) }
                );
              }}
            >
              Reject
            </Button>
            <Button
              isLoading={approveMutation.isPending}
              disabled={!reviewing}
              onClick={() => {
                if (!reviewing) return;
                approveMutation.mutate(
                  { id: reviewing.id, payload: { comment: comment || undefined } },
                  { onSuccess: () => setReviewing(null) }
                );
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
