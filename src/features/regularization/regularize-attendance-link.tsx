"use client";

import { Can } from "@/components/guards/permission-guard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRegularizationDialogStore } from "@/store/regularization-dialog-store";
import { toLocalDateKey } from "@/lib/date/calendar";

interface RegularizeAttendanceLinkProps {
  date?: string;
  className?: string;
  label?: string;
}

export function RegularizeAttendanceLink({
  date,
  className,
  label = "Request regularization",
}: RegularizeAttendanceLinkProps) {
  const openForDate = useRegularizationDialogStore((s) => s.openForDate);

  return (
    <Can permission="regularization.create">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(className)}
        onClick={(e) => {
          e.stopPropagation();
          openForDate(date ? toLocalDateKey(date) : undefined);
        }}
      >
        {label}
      </Button>
    </Can>
  );
}
