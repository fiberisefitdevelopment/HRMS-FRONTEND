"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OwnerAttentionStripProps {
  pendingApprovals: number;
}

/** Only surfaces items that need an owner decision — not operational punch metrics. */
export function OwnerAttentionStrip({ pendingApprovals }: OwnerAttentionStripProps) {
  if (pendingApprovals <= 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-500/15 p-2 text-amber-700 dark:text-amber-400">
          <ClipboardCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {pendingApprovals} approval{pendingApprovals === 1 ? "" : "s"} waiting for you
          </p>
          <p className="text-xs text-muted-foreground">
            Review leave and workflow requests that need your sign-off.
          </p>
        </div>
      </div>
      <Link href="/approvals" className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
        Review approvals
      </Link>
    </div>
  );
}
