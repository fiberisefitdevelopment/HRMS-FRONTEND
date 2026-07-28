"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wallet } from "lucide-react";
import { useLeaveBalancesQuery } from "@/hooks/queries/use-leave-queries";
import { useRegularizationEligibilityQuery } from "@/hooks/queries/use-regularization-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { getErrorMessage } from "@/services/api/error-handler";
import { formatLeaveDate } from "@/lib/leave/format";
import { toLocalDateKey } from "@/lib/date/calendar";
import type { LeaveBalance } from "@/types/leave";

function balanceLabel(item: LeaveBalance) {
  return item.name || item.leaveType?.replace(/_/g, " ") || item.leaveTypeCode;
}

function balanceHoverLabel(item: LeaveBalance) {
  const credit = item.lastCreditedAt
    ? `Last credit: ${formatLeaveDate(item.lastCreditedAt)}`
    : "No credit yet";
  const debit = item.lastDebitedAt
    ? `Last debit: ${formatLeaveDate(item.lastDebitedAt)}`
    : "No debit yet";
  return `${credit}\n${debit}`;
}

function isLop(item: LeaveBalance) {
  const code = item.leaveTypeCode?.toUpperCase();
  const type = item.leaveType?.toLowerCase();
  return code === "LOP" || type === "loss_of_pay" || type === "loss of pay";
}

export function LeaveBalancePanel() {
  const { hasPermission } = usePermissions();
  const canRegularize = hasPermission("regularization.create") || hasPermission("regularization.read");
  const today = toLocalDateKey(new Date());

  const { data, isLoading, isError, error } = useLeaveBalancesQuery();
  const { data: regularization, isLoading: regLoading } = useRegularizationEligibilityQuery(
    today,
    canRegularize
  );

  if (isLoading || (canRegularize && regLoading && !data)) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  const leaveItems = (data ?? []).filter((item) => !isLop(item));
  const remaining =
    regularization?.remaining ??
    (regularization?.policy?.monthlyLimit != null && regularization.usedThisMonth != null
      ? Math.max(0, regularization.policy.monthlyLimit - regularization.usedThisMonth)
      : null);
  const monthlyLimit = regularization?.policy?.monthlyLimit;
  const usedThisMonth = regularization?.usedThisMonth;

  if (!leaveItems.length && remaining == null) {
    return (
      <EmptyState
        icon={Wallet}
        title="No leave balance"
        description="Leave balances will appear here once credited by the backend."
      />
    );
  }

  const regHover =
    monthlyLimit != null
      ? `Used this month: ${usedThisMonth ?? 0} of ${monthlyLimit}\nRemaining: ${remaining ?? 0}`
      : remaining != null
        ? `Remaining this month: ${remaining}`
        : "Monthly regularization allowance";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {leaveItems.map((item) => (
          <Tooltip key={item.leaveTypeCode}>
            <TooltipTrigger asChild>
              <Card className="cursor-default transition-colors hover:bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize text-muted-foreground">
                    {balanceLabel(item)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.balance}</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="whitespace-pre-line text-center">
              {balanceHoverLabel(item)}
            </TooltipContent>
          </Tooltip>
        ))}

        {canRegularize && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-default transition-colors hover:bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Regularization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{remaining ?? "—"}</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="whitespace-pre-line text-center">
              {regHover}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
