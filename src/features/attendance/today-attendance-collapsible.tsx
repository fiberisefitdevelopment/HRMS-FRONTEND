"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, Clock, LogIn, LogOut, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AttendanceStatusBadge } from "./attendance-status-badge";
import { PunchSessionsTimeline } from "./punch-sessions-timeline";
import { formatMinutes, formatPunchTime } from "@/lib/attendance/format";
import {
  getFirstPunchIn,
  getLastPunchOut,
  getPunchSessions,
  hasOpenPunchSession,
} from "@/lib/attendance/punch-state";
import type { AttendanceToday } from "@/types/attendance";
import { cn } from "@/lib/utils";
import { RegularizeAttendanceLink } from "@/features/regularization/regularize-attendance-link";

interface TodayAttendanceCollapsibleProps {
  today: AttendanceToday;
  children?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function TodayAttendanceCollapsible({
  today,
  children,
  defaultOpen = false,
  className,
}: TodayAttendanceCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = hasOpenPunchSession(today);
  const sessions = getPunchSessions(today);
  const firstIn = getFirstPunchIn(today);
  const lastOut = getLastPunchOut(today);
  const netMinutes = today.netWorkingMinutes ?? today.workingTimer?.netWorkingMinutes ?? null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
              open && "border-b bg-muted/20"
            )}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
              <AttendanceStatusBadge
                status={today.attendanceStatus}
                lateByMinutes={today.lateByMinutes}
                isRegularized={today.isRegularized}
              />
              {isOpen && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  On clock
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold">{formatMinutes(netMinutes)}</span>
              </span>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <LogIn className="h-3 w-3 text-emerald-600" />
                {formatPunchTime(firstIn)}
              </span>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <LogOut className="h-3 w-3 text-rose-500" />
                {formatPunchTime(lastOut)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                {sessions.length} session{sessions.length === 1 ? "" : "s"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 border-t bg-muted/10 p-4 pt-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryChip label="First in" value={formatPunchTime(firstIn)} />
              <SummaryChip label="Last out" value={formatPunchTime(lastOut)} />
              <SummaryChip label="Net hours" value={formatMinutes(netMinutes)} />
              <SummaryChip label="Sessions" value={String(sessions.length)} />
            </div>

            {isOpen && today.workingTimer && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Live working time</span>
                <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatMinutes(today.workingTimer.netWorkingMinutes)}
                </span>
              </div>
            )}

            {today.lateByMinutes != null && today.lateByMinutes > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Late by {formatMinutes(today.lateByMinutes)}
                </p>
                {!today.isRegularized && (
                  <RegularizeAttendanceLink date={today.date} className="h-7 text-xs" />
                )}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Session details
              </p>
              <PunchSessionsTimeline sessions={sessions} compact minimalEmpty />
            </div>

            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
