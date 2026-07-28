"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { useHolidaysQuery } from "@/hooks/queries/use-holiday-queries";
import { toLocalDateKey } from "@/lib/date/calendar";
import type { Holiday } from "@/services/holidays/holiday.service";
import { cn } from "@/lib/utils";

function holidayDateValue(holiday: Holiday) {
  return holiday.holidayDate || holiday.date || "";
}

function holidayName(holiday: Holiday) {
  return holiday.holidayName || holiday.name || "Holiday";
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function parseHolidayDate(value: string) {
  if (!value) return null;
  const key = toLocalDateKey(value);
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatHolidayDate(value: string) {
  const d = parseHolidayDate(value);
  if (!d) return "—";
  return d.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(value: string) {
  const d = parseHolidayDate(value);
  if (!d) return null;
  const today = startOfToday();
  const holiday = new Date(d);
  holiday.setHours(0, 0, 0, 0);
  return Math.round((holiday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DayBadge({ date }: { date: string }) {
  const d = parseHolidayDate(date);
  if (!d) return null;
  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border bg-background text-center">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {d.toLocaleDateString([], { month: "short" })}
      </span>
      <span className="text-lg font-semibold leading-none tabular-nums">{d.getDate()}</span>
    </div>
  );
}

function HolidayRow({
  holiday,
  muted = false,
}: {
  holiday: Holiday;
  muted?: boolean;
}) {
  const date = holidayDateValue(holiday);
  const until = daysUntil(date);
  const isToday = until === 0;

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-3 sm:items-center sm:px-4",
        muted && "border-dashed bg-muted/20 opacity-80",
        isToday && !muted && "border-primary/30 bg-primary/5"
      )}
    >
      <DayBadge date={date} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-medium", muted && "text-muted-foreground")}>{holidayName(holiday)}</p>
          {isToday && !muted ? <Badge variant="success">Today</Badge> : null}
          {!muted && until != null && until > 0 && until <= 14 ? (
            <Badge variant="secondary">{until === 1 ? "Tomorrow" : `In ${until} days`}</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{formatHolidayDate(date)}</p>
        {holiday.description ? (
          <p className="text-sm text-muted-foreground">{holiday.description}</p>
        ) : null}
        {holiday.location ? (
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {holiday.location}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function HolidaySection({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  muted = false,
}: {
  title: string;
  description: string;
  items: Holiday[];
  emptyTitle: string;
  emptyDescription: string;
  muted?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {items.length}
        </Badge>
      </div>

      {!items.length ? (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <EmptyState
              icon={CalendarDays}
              title={emptyTitle}
              description={emptyDescription}
              className="py-2"
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((holiday) => (
            <HolidayRow key={holiday.id} holiday={holiday} muted={muted} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function HolidaysPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data: holidays = [], isLoading } = useHolidaysQuery({ year });

  const { upcoming, past } = useMemo(() => {
    const today = startOfToday();
    const sorted = [...holidays]
      .map((holiday) => ({
        holiday,
        date: parseHolidayDate(holidayDateValue(holiday)),
      }))
      .filter((item) => item.date)
      .sort((a, b) => a.date!.getTime() - b.date!.getTime());

    const upcomingList: Holiday[] = [];
    const pastList: Holiday[] = [];

    for (const item of sorted) {
      const day = new Date(item.date!);
      day.setHours(0, 0, 0, 0);
      if (day.getTime() >= today.getTime()) upcomingList.push(item.holiday);
      else pastList.push(item.holiday);
    }

    return {
      upcoming: upcomingList,
      past: pastList.reverse(),
    };
  }, [holidays]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {upcoming.length} upcoming · {past.length} past in {year}
        </p>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-14 text-center text-sm font-medium tabular-nums">{year}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <HolidaySection
        title="Upcoming"
        description="Holidays still ahead this year"
        items={upcoming}
        emptyTitle={`No upcoming holidays in ${year}`}
        emptyDescription="Nothing left on the calendar for the rest of this year."
      />

      <HolidaySection
        title="Past"
        description="Holidays that have already passed"
        items={past}
        emptyTitle={`No past holidays in ${year}`}
        emptyDescription="Nothing has occurred yet for this year."
        muted
      />
    </div>
  );
}
