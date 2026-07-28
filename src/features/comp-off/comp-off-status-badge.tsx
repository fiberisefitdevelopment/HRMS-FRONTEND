"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompOffStatus } from "@/types/comp-off";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function CompOffStatusBadge({
  status,
  className,
}: {
  status?: CompOffStatus | string | null;
  className?: string;
}) {
  const key = (status ?? "pending").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn("border-0 capitalize", STATUS_STYLES[key] ?? STATUS_STYLES.pending, className)}
    >
      {key}
    </Badge>
  );
}
