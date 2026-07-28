"use client";

import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinutes } from "@/lib/attendance/format";
import type { WorkingTimer } from "@/types/attendance";

interface WorkTimerProps {
  workingTimer?: WorkingTimer;
  isActive: boolean;
  isLoading?: boolean;
}

/** Displays working time values from backend workingTimer — refreshed via API polling. */
export function WorkTimer({ workingTimer, isActive, isLoading }: WorkTimerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!isActive || !workingTimer) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Working Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums tracking-tight">
          {formatMinutes(workingTimer.netWorkingMinutes)}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Gross: {formatMinutes(workingTimer.grossWorkingMinutes)}</span>
          <span>Breaks: {formatMinutes(workingTimer.breakDurationMinutes)}</span>
          <span>Net: {formatMinutes(workingTimer.netWorkingMinutes)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
