"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAttendanceColumns } from "../attendance-columns";
import { useAttendanceReportQuery } from "@/hooks/queries/use-attendance-queries";
import { useExportAttendanceMutation } from "@/hooks/mutations/use-attendance-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import type { ReportType } from "@/types/attendance";
import { StatCard } from "@/components/ui/stat-card";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "department", label: "Department" },
  { value: "shift", label: "Shift" },
  { value: "late", label: "Late" },
  { value: "regularization", label: "Regularization" },
];

export function AttendanceReportsPage() {
  const [type, setType] = useState<ReportType>("daily");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      type,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 20,
    }),
    [type, dateFrom, dateTo, page]
  );

  const { data, isLoading, isError, error } = useAttendanceReportQuery(type, params);
  const exportMutation = useExportAttendanceMutation();
  const columns = useMemo(() => getAttendanceColumns(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description="Generate and export attendance reports"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" isLoading={exportMutation.isPending}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportMutation.mutate({ type, format: "xlsx", params })}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportMutation.mutate({ type, format: "csv", params })}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={type} onValueChange={(v) => { setType(v as ReportType); setPage(1); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {data?.statusSummary && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.statusSummary).map(([status, count]) => (
            <StatCard key={status} title={status.replace(/_/g, " ")} value={count} />
          ))}
        </div>
      )}

      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={
          data
            ? {
                page,
                total: data.totalRecords,
                totalPages: Math.ceil(data.totalRecords / 20) || 1,
              }
            : undefined
        }
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        enableSearch={false}
        getRowId={(row) => row.id}
        emptyMessage="No report data for selected filters"
      />
    </div>
  );
}
