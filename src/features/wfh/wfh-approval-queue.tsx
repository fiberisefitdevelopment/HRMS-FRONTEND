"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home } from "lucide-react";
import { useWfhListQuery } from "@/hooks/queries/use-wfh-queries";
import { WfhStatusBadge } from "./wfh-status-badge";
import { WfhDetailDialog } from "./wfh-detail-dialog";
import { formatLeaveDate } from "@/lib/leave/format";
import { getErrorMessage } from "@/services/api/error-handler";
import type { WfhRequest } from "@/types/wfh";

type QueueMode = "pending" | "approved";

function getWfhEmployeeName(request: WfhRequest): string {
  const fromUser =
    request.user?.fullName ??
    [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ");
  return fromUser || request.employee?.employeeId || "—";
}

interface WfhApprovalQueueProps {
  mode?: QueueMode;
}

export function WfhApprovalQueue({ mode = "pending" }: WfhApprovalQueueProps) {
  const isApproved = mode === "approved";
  const { data, isLoading, isError, error } = useWfhListQuery({
    status: isApproved ? "approved" : "pending",
    limit: 100,
    sort: "-createdAt",
  });
  const [selected, setSelected] = useState<WfhRequest | null>(null);

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
        icon={Home}
        title={isApproved ? "No approved WFH" : "No pending WFH approvals"}
        description={
          isApproved
            ? "Approved work-from-home requests will appear here."
            : "Team work-from-home requests waiting for your approval will appear here."
        }
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isApproved ? "Approved Work From Home" : "Pending Work From Home"} ({queue.length})
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
                  {getWfhEmployeeName(item)}
                  {item.employee?.employeeId ? (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      ({item.employee.employeeId})
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{formatLeaveDate(item.date)}</p>
                {item.reason?.trim() ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.reason}</p>
                ) : null}
                <WfhStatusBadge status={item.status} />
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

      <WfhDetailDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        canApprove={!isApproved}
      />
    </>
  );
}
