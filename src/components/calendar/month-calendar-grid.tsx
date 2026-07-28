"use client";

import Link from "next/link";
import { CalendarDays, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatPunchTime } from "@/lib/attendance/format";
import { WEEKDAYS, buildMonthCells, monthDateKey } from "@/lib/date/month-calendar";
import type {
  CalendarDayEvent,
  CalendarEventMap,
  CalendarPunchMap,
} from "@/lib/calendar/calendar-events";

interface MonthCalendarGridProps {
  year: number;
  month: number;
  eventMap: CalendarEventMap;
  punchMap?: CalendarPunchMap;
  compact?: boolean;
  now?: Date;
  className?: string;
  onRegularizeDate?: (date: string) => void;
  onCompOffDate?: (date: string) => void;
  onApplyLeaveDate?: (date: string) => void;
}

export function MonthCalendarGrid({
  year,
  month,
  eventMap,
  punchMap,
  compact = false,
  now = new Date(),
  className,
  onRegularizeDate,
  onCompOffDate,
  onApplyLeaveDate,
}: MonthCalendarGridProps) {
  const cells = buildMonthCells(year, month);
  const dayActionsEnabled = Boolean(onApplyLeaveDate || onCompOffDate);

  return (
    <TooltipProvider delayDuration={250}>
      <div className={cn("space-y-1", className)}>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {compact ? d.charAt(0) : d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className={compact ? "min-h-[52px]" : "min-h-[80px]"} />;
            }

            const key = monthDateKey(year, month, day);
            const events = eventMap.get(key) ?? [];
            const punch = punchMap?.get(key);
            const isToday =
              day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

            return (
              <CalendarDayCell
                key={key}
                dateKey={key}
                day={day}
                events={events}
                punch={punch}
                compact={compact}
                isToday={isToday}
                dayActionsEnabled={dayActionsEnabled}
                onRegularizeDate={onRegularizeDate}
                onCompOffDate={onCompOffDate}
                onApplyLeaveDate={onApplyLeaveDate}
              />
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

function punchTooltipLabel(punch?: { punchIn?: string | null; punchOut?: string | null }) {
  if (!punch?.punchIn && !punch?.punchOut) {
    return "No punch recorded";
  }
  return `In: ${formatPunchTime(punch.punchIn)}\nOut: ${formatPunchTime(punch.punchOut)}`;
}

function DayCard({
  day,
  events,
  compact,
  isToday,
  interactive,
  onRegularizeDate,
  onCompOffDate,
}: {
  day: number;
  events: CalendarDayEvent[];
  compact: boolean;
  isToday: boolean;
  interactive?: boolean;
  onRegularizeDate?: (date: string) => void;
  onCompOffDate?: (date: string) => void;
}) {
  return (
    <Card
      className={cn(
        compact ? "min-h-[52px]" : "min-h-[80px]",
        isToday && "ring-1 ring-primary/40",
        interactive && "cursor-pointer transition-colors hover:bg-muted/40"
      )}
    >
      <CardContent className={compact ? "p-1.5" : "p-2"}>
        <span
          className={cn(
            "text-xs font-medium",
            isToday &&
              "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          )}
        >
          {day}
        </span>
        <div className="mt-0.5 space-y-0.5">
          {events.slice(0, compact ? 1 : 2).map((event, idx) => (
            <CalendarEventChip
              key={`${event.label}-${idx}`}
              event={event}
              compact={compact}
              onRegularizeDate={onRegularizeDate}
              onCompOffDate={onCompOffDate}
            />
          ))}
          {events.length > (compact ? 1 : 2) && (
            <p className={cn("text-muted-foreground", compact ? "text-[9px]" : "text-[10px]")}>
              +{events.length - (compact ? 1 : 2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarDayCell({
  dateKey,
  day,
  events,
  punch,
  compact,
  isToday,
  dayActionsEnabled,
  onRegularizeDate,
  onCompOffDate,
  onApplyLeaveDate,
}: {
  dateKey: string;
  day: number;
  events: CalendarDayEvent[];
  punch?: { punchIn?: string | null; punchOut?: string | null };
  compact: boolean;
  isToday: boolean;
  dayActionsEnabled: boolean;
  onRegularizeDate?: (date: string) => void;
  onCompOffDate?: (date: string) => void;
  onApplyLeaveDate?: (date: string) => void;
}) {
  const card = (
    <DayCard
      day={day}
      events={events}
      compact={compact}
      isToday={isToday}
      interactive={dayActionsEnabled}
      onRegularizeDate={onRegularizeDate}
      onCompOffDate={onCompOffDate}
    />
  );

  // Avoid nesting Tooltip inside DropdownMenuTrigger — Safari/Radix often
  // swallows the click and only shows the punch tooltip.
  if (!dayActionsEnabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="whitespace-pre-line text-center">
          {punchTooltipLabel(punch)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Actions for ${dateKey}`}
        >
          {card}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="whitespace-pre-line font-normal text-muted-foreground">
          {punchTooltipLabel(punch)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onApplyLeaveDate && (
          <DropdownMenuItem onClick={() => onApplyLeaveDate(dateKey)} className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Apply Leave
          </DropdownMenuItem>
        )}
        {onCompOffDate && (
          <DropdownMenuItem onClick={() => onCompOffDate(dateKey)} className="gap-2">
            <Timer className="h-4 w-4" />
            Raise Comp-off
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CalendarEventChip({
  event,
  compact,
  onRegularizeDate,
  onCompOffDate,
}: {
  event: CalendarDayEvent;
  compact: boolean;
  onRegularizeDate?: (date: string) => void;
  onCompOffDate?: (date: string) => void;
}) {
  const className = cn(
    "block truncate rounded px-1",
    compact ? "text-[9px]" : "text-[10px]",
    event.tone
  );

  if (event.action === "regularize" && onRegularizeDate && event.actionDate) {
    return (
      <button
        type="button"
        className={cn(className, "w-full text-left")}
        title={event.label}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRegularizeDate(event.actionDate!);
        }}
      >
        {event.label}
      </button>
    );
  }

  if (event.action === "comp_off" && onCompOffDate && event.actionDate) {
    return (
      <button
        type="button"
        className={cn(className, "w-full text-left")}
        title={event.label}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onCompOffDate(event.actionDate!);
        }}
      >
        {event.label}
      </button>
    );
  }

  if (event.href) {
    return (
      <Link
        href={event.href}
        className={className}
        title={event.label}
        onClick={(e) => e.stopPropagation()}
      >
        {event.label}
      </Link>
    );
  }

  return (
    <div className={className} title={event.label}>
      {event.label}
    </div>
  );
}
