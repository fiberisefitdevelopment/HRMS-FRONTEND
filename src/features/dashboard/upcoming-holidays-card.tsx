"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidaysQuery } from "@/hooks/queries/use-holiday-queries";
import { formatLeaveDate } from "@/lib/leave/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function UpcomingHolidaysCard({ limit = 20 }: { limit?: number }) {
  const { data: holidays = [], isLoading } = useHolidaysQuery({ upcoming: true });

  const upcoming = useMemo(
    () =>
      [...holidays]
        .sort(
          (a, b) =>
            new Date(a.holidayDate || a.date || "").getTime() -
            new Date(b.holidayDate || b.date || "").getTime()
        )
        .slice(0, limit),
    [holidays, limit]
  );

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="shrink-0 pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Upcoming Holidays
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {!upcoming.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              No upcoming holidays scheduled.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((holiday) => (
              <li
                key={holiday.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium">
                  {holiday.holidayName || holiday.name}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatLeaveDate(holiday.holidayDate || holiday.date || "")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="shrink-0 border-t pt-3">
        <Link
          href="/holidays"
          className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}
        >
          View all holidays
        </Link>
      </CardFooter>
    </Card>
  );
}
