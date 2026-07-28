"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { useWorkflowHistoryQuery } from "@/hooks/queries/use-workflow-queries";
import { getErrorMessage } from "@/services/api/error-handler";
import { formatLeaveDate, getActorDisplayName } from "@/lib/leave/format";
import { cn } from "@/lib/utils";
import type { LeaveApproval } from "@/types/leave";

interface ApprovalTimelineProps {
  /** Legacy leave records only — new leave no longer uses workflow */
  workflowInstanceId?: string | null;
  approvals?: LeaveApproval[];
}

export function ApprovalTimeline({ workflowInstanceId, approvals }: ApprovalTimelineProps) {
  const leaveApprovals = approvals ?? [];
  const useLegacyWorkflow = Boolean(workflowInstanceId) && leaveApprovals.length === 0;

  const { data, isLoading, isError, error } = useWorkflowHistoryQuery(
    useLegacyWorkflow ? (workflowInstanceId ?? undefined) : undefined
  );

  if (!leaveApprovals.length && !workflowInstanceId) {
    return <p className="text-sm text-muted-foreground">No approval actions yet.</p>;
  }

  if (leaveApprovals.length) {
    return (
      <ol className="space-y-3">
        {leaveApprovals.map((step, index) => {
          const status = (step.status ?? "pending").toLowerCase();
          const Icon =
            status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Circle;
          const actor =
            step.approver != null
              ? getActorDisplayName(step.approver)
              : step.approverId
                ? String(step.approverId)
                : null;

          return (
            <li key={`${step.stage}-${index}`} className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  status === "rejected"
                    ? "text-destructive"
                    : status === "approved"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                )}
              />
              <div>
                <p className="text-sm font-medium capitalize">
                  {step.stage ?? "Approver"} · {step.status ?? "pending"}
                  {actor ? ` · ${actor}` : ""}
                </p>
                {step.comment && <p className="text-sm text-muted-foreground">{step.comment}</p>}
                <p className="text-xs text-muted-foreground">{formatLeaveDate(step.actedAt)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  if (!useLegacyWorkflow) {
    return <p className="text-sm text-muted-foreground">No approval actions yet.</p>;
  }

  if (isLoading) return <Skeleton className="h-32" />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">No approval actions yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {data.map((action, index) => {
        const actionName = (action.action ?? "pending").toLowerCase();
        const actionLabel =
          actionName === "approve" || actionName === "approved"
            ? "Approved"
            : actionName === "reject" || actionName === "rejected"
              ? "Rejected"
              : action.action ?? "Action";
        const Icon =
          actionName === "approved" || actionName === "approve"
            ? CheckCircle2
            : actionName === "rejected" || actionName === "reject"
              ? XCircle
              : Circle;

        return (
          <li key={action.id ?? index} className="flex gap-3">
            <Icon
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                actionName.includes("reject")
                  ? "text-destructive"
                  : actionName.includes("approv")
                    ? "text-emerald-600"
                    : "text-muted-foreground"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {actionLabel} by {getActorDisplayName(action.actor)}
              </p>
              {action.comment && (
                <p className="text-sm text-muted-foreground">{action.comment}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Level {action.levelOrder ?? "—"} · {formatLeaveDate(action.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
