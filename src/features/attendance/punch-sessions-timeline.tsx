"use client";

import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMinutes, formatPunchTime } from "@/lib/attendance/format";
import {
  getSessionDurationMinutes,
  isSessionActive,
} from "@/lib/attendance/punch-state";
import type { PunchSession } from "@/types/attendance";

interface PunchSessionsTimelineProps {
  sessions: PunchSession[];
  compact?: boolean;
  minimalEmpty?: boolean;
  className?: string;
}

function SessionRow({
  session,
  index,
  isLast,
  compact,
}: {
  session: PunchSession;
  index: number;
  isLast: boolean;
  compact?: boolean;
}) {
  const active = isSessionActive(session);
  const duration = getSessionDurationMinutes(session);

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold",
            active
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-muted-foreground/30 bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border min-h-6" />}
      </div>

      <div
        className={cn(
          "mb-3 flex-1 rounded-lg border p-3",
          active && "border-emerald-500/40 bg-emerald-500/5",
          compact && "p-2.5"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <LogIn className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-muted-foreground">In</span>
              <span className="font-semibold tabular-nums">{formatPunchTime(session.punchIn)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LogOut className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-muted-foreground">Out</span>
              <span className="font-semibold tabular-nums">
                {session.punchOut?.timestamp ? formatPunchTime(session.punchOut) : "—"}
              </span>
            </div>
          </div>
          <div className="text-right">
            {active ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            ) : duration != null ? (
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {formatMinutes(duration)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PunchSessionsTimeline({ sessions, compact, minimalEmpty, className }: PunchSessionsTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground",
          minimalEmpty ? "px-3 py-4 text-xs" : "flex-col py-8",
          className
        )}
      >
        {!minimalEmpty && <LogIn className="mb-2 h-8 w-8 text-muted-foreground/40" />}
        <p className={cn(minimalEmpty ? "" : "text-sm font-medium")}>
          {minimalEmpty ? "No punches yet today — use the navbar to punch in" : "No punches yet today"}
        </p>
        {!minimalEmpty && (
          <p className="mt-1 text-xs text-muted-foreground">Punch in to start tracking your day</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {sessions.map((session, index) => (
        <SessionRow
          key={`${session.punchIn?.timestamp ?? "session"}-${index}`}
          session={session}
          index={index}
          isLast={index === sessions.length - 1}
          compact={compact}
        />
      ))}
    </div>
  );
}
