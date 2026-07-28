"use client";

import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  CalendarClock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { RegularizeAttendanceLink } from "@/features/regularization/regularize-attendance-link";

interface MonthlySummaryLike {
  present: number;
  late: number;
  absent: number;
  regularized?: number;
  half_day?: number;
  total?: number;
}

interface AttendanceOverviewProps {
  today: AttendanceToday;
  monthlySummary?: MonthlySummaryLike;
  variant?: "full" | "compact";
  showMonthly?: boolean;
  showSessions?: boolean;
  detailHref?: string;
  className?: string;
}

function MetricTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: "emerald" | "rose" | "blue";
}) {
  const accentClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    blue: "text-blue-600 dark:text-blue-400",
  }[accent ?? "blue"];

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accentClass)} />
        <span>{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function MonthlyStatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const toneClass = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    slate: "text-muted-foreground",
  }[tone];

  return (
    <div className="flex flex-1 flex-col items-center rounded-lg border bg-muted/30 px-2 py-2.5 text-center">
      <p className={cn("text-xl font-bold tabular-nums", toneClass)}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function AttendanceOverview({
  today,
  monthlySummary,
  variant = "full",
  showMonthly = true,
  showSessions = true,
  detailHref,
  className,
}: AttendanceOverviewProps) {
  const isOpen = hasOpenPunchSession(today);
  const sessions = getPunchSessions(today);
  const firstIn = getFirstPunchIn(today);
  const lastOut = getLastPunchOut(today);
  const netMinutes = today.netWorkingMinutes ?? today.workingTimer?.netWorkingMinutes ?? null;
  const isCompact = variant === "compact";

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Status hero */}
      <div
        className={cn(
          "border-b bg-gradient-to-br from-muted/60 via-background to-background px-5 py-4",
          isOpen && "from-emerald-500/5 via-background to-background",
          isCompact && "px-4 py-3"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <AttendanceStatusBadge
                status={today.attendanceStatus}
                lateByMinutes={today.lateByMinutes}
                isRegularized={today.isRegularized}
              />
              {isOpen && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  On the clock
                </span>
              )}
            </div>
            {today.shift && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                {today.shift.name} · {today.shift.startTime} – {today.shift.endTime}
              </p>
            )}
            {(today.isRegularized || today.isAutoPunchOut) && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {today.isRegularized && (
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Regularization applied
                  </span>
                )}
                {today.isAutoPunchOut && (
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Auto punched out at 11:00 PM
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Net hours
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {formatMinutes(netMinutes)}
            </p>
            <p className="text-[10px] text-muted-foreground">First in → last out</p>
          </div>
        </div>

        {today.lateByMinutes != null && today.lateByMinutes > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Late by {formatMinutes(today.lateByMinutes)}
            </p>
            {!today.isRegularized && (
              <RegularizeAttendanceLink date={today.date} className="h-7 text-xs" />
            )}
          </div>
        )}
      </div>

      <CardContent className={cn("space-y-4 p-5", isCompact && "space-y-3 p-4")}>
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2">
          <MetricTile
            icon={LogIn}
            label="First in"
            value={formatPunchTime(firstIn)}
            accent="emerald"
          />
          <MetricTile
            icon={LogOut}
            label="Last out"
            value={formatPunchTime(lastOut)}
            accent="rose"
          />
          <MetricTile
            icon={Timer}
            label="Sessions"
            value={String(sessions.length)}
            accent="blue"
          />
        </div>

        {/* Live timer when active */}
        {isOpen && today.workingTimer && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Live working time</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatMinutes(today.workingTimer.netWorkingMinutes)}
            </p>
          </div>
        )}

        {/* Sessions timeline */}
        {showSessions && !isCompact && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today&apos;s sessions
            </p>
            <PunchSessionsTimeline sessions={sessions} />
          </div>
        )}

        {showSessions && isCompact && sessions.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {sessions.length} punch sessions
            </p>
            <PunchSessionsTimeline sessions={sessions} compact />
          </div>
        )}

        {/* Monthly summary */}
        {showMonthly && monthlySummary && (
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This month
            </p>
            <div className="flex gap-2">
              <MonthlyStatPill label="Present" value={monthlySummary.present} tone="emerald" />
              <MonthlyStatPill label="Late" value={monthlySummary.late} tone="amber" />
              <MonthlyStatPill label="Absent" value={monthlySummary.absent} tone="rose" />
            </div>
          </div>
        )}

        {detailHref && (
          <div className="border-t pt-4">
            <Link
              href={detailHref}
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full justify-center gap-2")}
            >
              View attendance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
