"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthCalendarNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
  className?: string;
}

export function MonthCalendarNav({
  year,
  month,
  onPrev,
  onNext,
  compact = false,
  className,
}: MonthCalendarNavProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
        {new Date(year, month - 1).toLocaleDateString([], { month: "long", year: "numeric" })}
      </h3>
      <Button variant="outline" size="icon" onClick={onNext} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
