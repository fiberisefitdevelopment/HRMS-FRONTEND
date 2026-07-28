"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WfhStatus } from "@/types/wfh";

const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  approved: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  rejected: "bg-red-100 text-red-900 hover:bg-red-100",
  cancelled: "bg-muted text-muted-foreground hover:bg-muted",
};

export function WfhStatusBadge({ status }: { status: WfhStatus | string }) {
  const key = String(status || "").toLowerCase();
  return (
    <Badge variant="secondary" className={cn("capitalize font-normal", STYLES[key])}>
      {key.replace(/_/g, " ") || "—"}
    </Badge>
  );
}
