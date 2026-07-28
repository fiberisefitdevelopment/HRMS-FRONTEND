"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useAuthStore } from "@/store/auth-store";
import {
  excludeOwnerFromEmployees,
  getDepartmentHeadcount,
} from "@/lib/employee/owner-dashboard-helpers";

export function OwnerOrgSnapshotCard({ limit = 6 }: { limit?: number }) {
  const ownerUserId = useAuthStore((s) => s.user?.id);
  const { data, isLoading } = useEmployeesQuery({
    status: "active",
    limit: 500,
    sort: "firstName",
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const workforce = excludeOwnerFromEmployees(data?.data ?? [], ownerUserId);
  const departments = getDepartmentHeadcount(workforce).slice(0, limit);
  const maxCount = departments[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Organization snapshot
        </CardTitle>
        <Link
          href="/organization"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Active workforce</p>
          <p className="text-2xl font-semibold tabular-nums">{workforce.length}</p>
          <p className="text-xs text-muted-foreground">
            across {departments.length} department{departments.length === 1 ? "" : "s"}
          </p>
        </div>

        {!departments.length ? (
          <p className="py-2 text-center text-sm text-muted-foreground">No department data yet.</p>
        ) : (
          <ul className="space-y-3">
            {departments.map((department) => (
              <li key={department.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{department.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{department.count}</span>
                </div>
                <Progress value={(department.count / maxCount) * 100} className="h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
