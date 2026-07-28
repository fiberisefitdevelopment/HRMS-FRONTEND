"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OwnerWorkforceInsightProps {
  yetToPunch: number;
  late: number;
  atWork: number;
}

/** Informational workforce status — not framed as owner action items. */
export function OwnerWorkforceInsight({ yetToPunch, late, atWork }: OwnerWorkforceInsightProps) {
  if (yetToPunch <= 0 && late <= 0 && atWork <= 0) return null;

  const parts: string[] = [];
  if (atWork > 0) parts.push(`${atWork} currently at work`);
  if (yetToPunch > 0) parts.push(`${yetToPunch} not yet checked in`);
  if (late > 0) parts.push(`${late} late today`);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border bg-background p-2 text-muted-foreground">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">Today&apos;s workforce</p>
          <p className="text-sm text-muted-foreground">{parts.join(" · ")}</p>
        </div>
      </div>
      <Link
        href="/attendance"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
      >
        View attendance
      </Link>
    </div>
  );
}
