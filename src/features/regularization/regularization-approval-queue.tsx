"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList } from "lucide-react";
import { useRegularizationListQuery } from "@/hooks/queries/use-regularization-queries";
import { RegularizationStatusBadge } from "./regularization-status-badge";
import { RegularizationDetailDialog } from "./regularization-detail-dialog";
import {
  formatLateBy,
  formatRegularizationPunchTime,
  formatRequestDate,
  getRegularizationEmployeeName,
} from "@/lib/regularization/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { RegularizationRequest } from "@/types/regularization";

type QueueMode = "pending" | "approved";

interface RegularizationApprovalQueueProps {
  mode?: QueueMode;
}

export function RegularizationApprovalQueue({
  mode = "pending",
}: RegularizationApprovalQueueProps) {
  const isApproved = mode === "approved";
  const { data, isLoading, isError, error } = useRegularizationListQuery({
    status: isApproved ? "approved" : "pending",
    limit: 100,
    sort: "-createdAt",
  });
  const [selected, setSelected] = useState<RegularizationRequest | null>(null);

  const queue = (data?.data ?? []).filter((item) =>
    isApproved ? item.status === "approved" : item.status === "pending"
  );

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
        title={
          isApproved
            ? "No approved regularization"
            : "No pending regularization approvals"
        }
        description={
          isApproved
            ? "Approved regularization requests will appear here."
            : "Team regularization requests waiting for your approval will appear here."
        }
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isApproved ? "Approved Regularization" : "Pending Regularization"} ({queue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">
                  {getRegularizationEmployeeName(item)}
                  {item.employee?.employeeId ? (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      ({item.employee.employeeId})
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRequestDate(item)}
                  {item.punchInDisplay || item.punchInAt
                    ? ` · In ${formatRegularizationPunchTime(item.punchInAt, item.punchInDisplay)}`
                    : ""}
                  {item.lateByMinutes != null ? ` · Late ${formatLateBy(item.lateByMinutes)}` : ""}
                </p>
                {item.windowDisplay && (
                  <p className="text-xs text-muted-foreground">Window: {item.windowDisplay}</p>
                )}
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.reason}</p>
                <RegularizationStatusBadge status={item.status} />
              </div>
              <Button
                size="sm"
                variant={isApproved ? "outline" : "default"}
                onClick={() => setSelected(item)}
              >
                {isApproved ? "View" : "Review & Approve"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <RegularizationDetailDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        canApprove={!isApproved}
      />
    </>
  );
}
