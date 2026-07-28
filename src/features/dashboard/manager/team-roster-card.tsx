"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { useManagerTeamQuery } from "@/hooks/queries/use-manager-queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TeamRosterCard({ limit = 6 }: { limit?: number }) {
  const { data, isLoading } = useManagerTeamQuery({ limit, sort: "firstName" });
  const members = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <div className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            My Team
            {data?.meta.total != null && (
              <span className="text-xs font-normal text-muted-foreground">({data.meta.total})</span>
            )}
          </CardTitle>
          <Link href="/employees" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs shrink-0")}>
            View all
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">Open a member to view their attendance</p>
      </CardHeader>
      <CardContent>
        {!members.length ? (
          <EmptyState
            icon={Users}
            title="No team members"
            description="Employees assigned to you will appear here."
            className="py-6"
          />
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/employees/${member.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.employeeId}
                      {member.department?.name ? ` · ${member.department.name}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      member.status === "active"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {member.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
