"use client";

import { Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TodayAttendanceCollapsible } from "./today-attendance-collapsible";
import { useBreakEndMutation, useBreakStartMutation } from "@/hooks/mutations/use-attendance-mutations";
import { useAttendanceTodayQuery } from "@/hooks/queries/use-attendance-queries";
import type { BreakType } from "@/types/attendance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/services/api/error-handler";
import { hasOpenPunchSession } from "@/lib/attendance/punch-state";

const BREAKS: { type: BreakType; label: string; icon: typeof Coffee }[] = [
  { type: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { type: "tea_break_1", label: "Tea Break 1", icon: Coffee },
  { type: "tea_break_2", label: "Tea Break 2", icon: Coffee },
];

export function PunchPanel() {
  const { data: today, isLoading, isError, error } = useAttendanceTodayQuery();
  const breakStart = useBreakStartMutation();
  const breakEnd = useBreakEndMutation();

  const isMutating = breakStart.isPending || breakEnd.isPending;

  if (isLoading) {
    return <Skeleton className="h-12 w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (!today) return null;

  const isOpen = hasOpenPunchSession(today);

  return (
    <TodayAttendanceCollapsible today={today} defaultOpen={false}>
      {isOpen && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Breaks</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {BREAKS.map(({ type, label, icon: Icon }) => (
              <div
                key={type}
                className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {label}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isMutating}
                    isLoading={breakStart.isPending}
                    onClick={() => breakStart.mutate({ breakType: type })}
                  >
                    Start
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isMutating}
                    isLoading={breakEnd.isPending}
                    onClick={() => breakEnd.mutate({ breakType: type })}
                  >
                    End
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </TodayAttendanceCollapsible>
  );
}
