"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { employeesService } from "@/services/employees/employees.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";

interface OwnerDashboardHeaderProps {
  greeting: string;
  firstName: string;
  companyName?: string;
  dateLabel: string;
  workforceTotal: number;
  atWork: number;
  onLeave: number;
  pendingApprovals: number;
  attendanceRate: number;
  isLoading?: boolean;
}

export function OwnerDashboardHeader({
  greeting,
  firstName,
  companyName,
  dateLabel,
  workforceTotal,
  atWork,
  onLeave,
  pendingApprovals,
  attendanceRate,
  isLoading,
}: OwnerDashboardHeaderProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  const { data, isLoading: searchLoading, isFetching } = useQuery({
    queryKey: QUERY_KEYS.employee.all({ search: trimmed, limit: 5, status: "active" }),
    queryFn: () => employeesService.list({ search: trimmed, limit: 5, status: "active" }),
    enabled: isAuthenticated && hasPermission("employee.read") && enabled,
  });

  const results = useMemo(() => data?.data ?? [], [data]);

  if (isLoading) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative bg-gradient-to-br from-primary/[0.06] via-background to-violet-500/[0.04] px-5 py-5 md:px-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Crown className="h-3 w-3 text-amber-500" />
              Owner dashboard
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{firstName}</h1>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {companyName ? `${companyName} · ` : ""}
                {dateLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <PresenceRing value={attendanceRate} atWork={atWork} total={workforceTotal} />
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <HeaderStat label="Workforce" value={workforceTotal} />
              <HeaderStat label="At work" value={atWork} accent="emerald" />
              <HeaderStat label="On leave" value={onLeave} accent="blue" />
              <HeaderStat
                label="Pending"
                value={pendingApprovals}
                accent={pendingApprovals > 0 ? "amber" : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/20 px-4 py-3 md:px-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Find anyone by name, email, or employee ID…"
          className="w-full"
        />

        {enabled && (searchLoading || isFetching) && (
          <div className="mt-2 space-y-1.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        )}

        {enabled && !searchLoading && !isFetching && (
          <ul className="mt-2 divide-y rounded-lg border bg-background">
            {!results.length ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">No employees found.</li>
            ) : (
              results.map((employee) => (
                <li key={employee.id}>
                  <Link
                    href={`/employees/${employee.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{employee.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {employee.employeeId}
                        {employee.department?.name ? ` · ${employee.department.name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-primary">View</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "blue" | "amber";
}) {
  const accentClasses = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-xl font-semibold tabular-nums",
          accent ? accentClasses[accent] : undefined
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PresenceRing({
  value,
  atWork,
  total,
}: {
  value: number;
  atWork: number;
  total: number;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[88px] w-[88px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{value}%</span>
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        {atWork} of {total} at work
      </p>
    </div>
  );
}
