"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { employeesService } from "@/services/employees/employees.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";

export function HrQuickSearch() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QUERY_KEYS.employee.all({ search: trimmed, limit: 6, status: "active" }),
    queryFn: () => employeesService.list({ search: trimmed, limit: 6, status: "active" }),
    enabled: isAuthenticated && hasPermission("employee.read") && enabled,
  });

  const results = useMemo(() => data?.data ?? [], [data]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Quick employee search</p>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, email, or employee ID…"
        />
        {enabled && (isLoading || isFetching) && (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {enabled && !isLoading && !isFetching && (
          <ul className="mt-3 space-y-1">
            {!results.length ? (
              <li className="px-2 py-3 text-sm text-muted-foreground">No employees found.</li>
            ) : (
              results.map((employee) => (
                <li key={employee.id}>
                  <Link
                    href={`/employees/${employee.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{employee.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {employee.employeeId}
                        {employee.department?.name ? ` · ${employee.department.name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">Open →</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
        {!enabled && (
          <p className="mt-2 text-xs text-muted-foreground">Type at least 2 characters to search.</p>
        )}
      </CardContent>
    </Card>
  );
}
