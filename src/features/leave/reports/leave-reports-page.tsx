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
import { useLeaveReportQuery } from "@/hooks/queries/use-leave-queries";
import { useExportLeaveMutation } from "@/hooks/mutations/use-leave-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import type { LeaveReportType } from "@/types/leave";
import type { ColumnDef } from "@tanstack/react-table";
import type { LeaveReportRow } from "@/types/leave";

const REPORT_TYPES: { value: LeaveReportType; label: string }[] = [
  { value: "balance", label: "Balance" },
  { value: "summary", label: "Summary" },
  { value: "company", label: "Company" },
  { value: "department", label: "Department" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "short_leave", label: "Short Leave" },
];

const reportColumns: ColumnDef<LeaveReportRow>[] = [
  { accessorKey: "employeeName", header: "Employee" },
  { accessorKey: "leaveTypeCode", header: "Type" },
  { accessorKey: "startDate", header: "Start" },
  { accessorKey: "endDate", header: "End" },
  { accessorKey: "totalDays", header: "Days" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "balance", header: "Balance" },
];

export function LeaveReportsPage() {
  const [type, setType] = useState<LeaveReportType>("summary");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const params = useMemo(
    () => ({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    }),
    [year, month]
  );

  const { data, isLoading, isError, error } = useLeaveReportQuery(type, params);
  const exportMutation = useExportLeaveMutation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Reports"
        description="Generate and export leave reports from the backend"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" isLoading={exportMutation.isPending}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => exportMutation.mutate({ type, format: "xlsx", params })}
              >
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportMutation.mutate({ type, format: "csv", params })}
              >
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as LeaveReportType)}>
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
          <Label>Year</Label>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Month</Label>
          <Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      <ServerDataTable<LeaveReportRow, unknown>
        columns={reportColumns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={1}
        pageSize={data?.data.length || 20}
        onPageChange={() => {}}
        enableSearch={false}
        getRowId={(row) => row.id ?? `${row.employeeName}-${row.leaveTypeCode}-${row.startDate}`}
        emptyMessage="No report data"
      />
    </div>
  );
}
