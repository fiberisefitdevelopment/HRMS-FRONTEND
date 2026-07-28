"use client";

import { useMemo, useState } from "react";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { AttendanceFilters } from "./attendance-filters";
import { getAttendanceColumns } from "./attendance-columns";
import { useAttendanceListQuery } from "@/hooks/queries/use-attendance-queries";
import { useServerListState } from "@/hooks/use-server-list-state";
import { getErrorMessage } from "@/services/api/error-handler";
import type { AttendanceListParams } from "@/types/attendance";

export function AttendanceHistory() {
  const { page, pageSize, search, setPage, onSearchChange } = useServerListState(20);
  const [filters, setFilters] = useState<AttendanceListParams>({});
  const [showFilters, setShowFilters] = useState(true);

  const queryParams = useMemo(
    () => ({ page, limit: pageSize, sort: "-date", ...filters }),
    [page, pageSize, filters]
  );

  const { data, isLoading, isError, error } = useAttendanceListQuery(queryParams);
  const columns = useMemo(() => getAttendanceColumns(), []);

  return (
    <div className="space-y-4">
      {showFilters && (
        <AttendanceFilters
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          onReset={() => {
            setFilters({});
            setPage(1);
          }}
        />
      )}

      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearchChange={onSearchChange}
        searchValue={search}
        enableSearch={false}
        getRowId={(row) => row.id}
        emptyMessage="No attendance records found"
        toolbar={
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        }
      />
    </div>
  );
}
