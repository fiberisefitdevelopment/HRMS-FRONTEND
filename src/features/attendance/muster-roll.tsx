"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatIstTime } from "@/lib/attendance/format";
import { useMonthCalendarState } from "@/hooks/use-month-calendar-state";
import { useMusterRollQuery } from "@/hooks/queries/use-attendance-queries";
import { useDepartmentsLookupQuery } from "@/hooks/queries/use-departments-queries";
import { useCorrectAttendanceByDateMutation } from "@/hooks/mutations/use-attendance-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { getErrorMessage } from "@/services/api/error-handler";
import type { MusterCode, MusterRollDayDetail, MusterRollEmployee } from "@/types/attendance";
import {
  MusterCellEditDialog,
  type MusterCellEditTarget,
} from "./muster-cell-edit-dialog";

const CODE_STYLES: Record<MusterCode, string> = {
  P: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  L: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  HD: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  A: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  LV: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  H: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  WO: "bg-muted text-muted-foreground",
  MP: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  NJ: "bg-transparent text-muted-foreground/40",
  "-": "bg-transparent text-muted-foreground/30",
};

const ALL_DEPARTMENTS = "__all__";
const PAGE_SIZE = 25;
const EDITABLE_CODES = new Set<MusterCode>(["P", "L", "HD", "A", "LV", "H", "WO", "MP"]);

function punchTooltipLabel(detail?: MusterRollDayDetail | null) {
  if (!detail?.punchIn && !detail?.punchOut) {
    return "No punch recorded";
  }
  return `In: ${formatIstTime(detail.punchIn, detail.punchInDisplay)}\nOut: ${formatIstTime(detail.punchOut, detail.punchOutDisplay)}`;
}

export function MusterRoll() {
  const { year, month, prevMonth, nextMonth } = useMonthCalendarState();
  const [departmentId, setDepartmentId] = useState<string>(ALL_DEPARTMENTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<MusterCellEditTarget | null>(null);
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("attendance.update");
  const correctMutation = useCorrectAttendanceByDateMutation();

  const { data: departments } = useDepartmentsLookupQuery();

  const params = useMemo(
    () => ({
      year,
      month,
      page,
      limit: PAGE_SIZE,
      ...(departmentId !== ALL_DEPARTMENTS ? { departmentId } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [year, month, page, departmentId, search]
  );

  const { data, isLoading, isError, error, isFetching } = useMusterRollQuery(params);

  const days = data?.days ?? [];
  const employees = data?.employees ?? [];
  const meta = data?.meta;

  const openEdit = (employee: MusterRollEmployee, dayNum: number, code: MusterCode) => {
    if (!canEdit || !EDITABLE_CODES.has(code)) return;
    const detail = employee.dayDetails?.[dayNum] ?? employee.dayDetails?.[String(dayNum)];
    const date = detail?.date ?? days.find((d) => d.day === dayNum)?.date;
    if (!date) return;
    setEditTarget({
      employeeProfileId: employee.employeeProfileId,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      date,
      code,
      detail: detail ?? null,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            Muster Roll
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setPage(1);
                prevMonth();
              }}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium">
              {new Date(year, month - 1).toLocaleDateString([], { month: "long", year: "numeric" })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setPage(1);
                nextMonth();
              }}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-56">
            <Select
              value={departmentId}
              onValueChange={(value) => {
                setDepartmentId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS}>All departments</SelectItem>
                {(departments?.data ?? []).map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-64">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by employee ID…"
              className="h-9"
            />
          </div>
        </div>

        <Legend legend={data?.legend} />
        {canEdit && (
          <p className="text-[11px] text-muted-foreground">
            Hover a cell for punch times. Click a status to update it — a reason is required and
            recorded in Audit Logs.
          </p>
        )}
      </CardHeader>

      <CardContent>
        {isError ? (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : !employees.length ? (
          <EmptyState
            icon={Table2}
            title="No employees found"
            description="No employees match the selected filters for this month."
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className={cn("overflow-x-auto rounded-lg border", isFetching && "opacity-60")}>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="sticky left-0 z-10 min-w-44 border-b border-r bg-muted/40 px-3 py-2 text-left font-medium">
                      Employee
                    </th>
                    {days.map((day) => (
                      <th
                        key={day.day}
                        className={cn(
                          "border-b px-1 py-2 text-center font-medium tabular-nums",
                          day.isHoliday && "bg-muted/60 text-muted-foreground"
                        )}
                        title={day.holidayName ?? undefined}
                      >
                        <div>{day.day}</div>
                        <div className="text-[9px] font-normal uppercase text-muted-foreground">
                          {["S", "M", "T", "W", "T", "F", "S"][day.weekday]}
                        </div>
                      </th>
                    ))}
                    <th className="border-b border-l px-2 py-2 text-center font-medium">P</th>
                    <th className="border-b px-2 py-2 text-center font-medium">A</th>
                    <th className="border-b px-2 py-2 text-center font-medium">LV</th>
                    <th className="border-b px-2 py-2 text-center font-medium">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.employeeProfileId} className="hover:bg-muted/20">
                      <td className="sticky left-0 z-10 border-b border-r bg-background px-3 py-1.5">
                        <Link
                          href={`/employees/${employee.employeeProfileId}?tab=attendance`}
                          className="block min-w-0 hover:underline"
                        >
                          <span className="block truncate font-medium">{employee.name}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {employee.employeeId}
                            {employee.department ? ` · ${employee.department}` : ""}
                            {employee.shift ? ` · ${employee.shift}` : ""}
                          </span>
                        </Link>
                      </td>
                      {days.map((day) => {
                        const code = (employee.days[day.day] ??
                          employee.days[String(day.day)] ??
                          "-") as MusterCode;
                        const detail =
                          employee.dayDetails?.[day.day] ??
                          employee.dayDetails?.[String(day.day)];
                        const editable = canEdit && EDITABLE_CODES.has(code);
                        const chip = (
                          <span
                            role={editable ? "button" : undefined}
                            tabIndex={editable ? 0 : undefined}
                            onClick={() => openEdit(employee, day.day, code)}
                            onKeyDown={(e) => {
                              if (!editable) return;
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openEdit(employee, day.day, code);
                              }
                            }}
                            className={cn(
                              "inline-flex h-6 w-7 items-center justify-center rounded text-[10px] font-semibold",
                              CODE_STYLES[code],
                              editable &&
                                "cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                          >
                            {code === "-" || code === "NJ" ? "" : code}
                          </span>
                        );

                        return (
                          <td key={day.day} className="border-b px-0.5 py-1 text-center">
                            {code === "-" || code === "NJ" ? (
                              chip
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>{chip}</TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="whitespace-pre-line text-center"
                                >
                                  {punchTooltipLabel(detail)}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-l px-2 py-1 text-center font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {employee.summary.present}
                      </td>
                      <td className="border-b px-2 py-1 text-center font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                        {employee.summary.absent}
                      </td>
                      <td className="border-b px-2 py-1 text-center font-semibold tabular-nums text-violet-600 dark:text-violet-400">
                        {employee.summary.leave}
                      </td>
                      <td className="border-b px-2 py-1 text-center font-semibold tabular-nums">
                        {employee.summary.payableDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TooltipProvider>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} employees
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <MusterCellEditDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        target={editTarget}
        isLoading={correctMutation.isPending}
        onSubmit={(values) => {
          if (!editTarget) return;
          correctMutation.mutate(
            {
              employeeProfileId: editTarget.employeeProfileId,
              date: editTarget.date,
              attendanceStatus: values.attendanceStatus,
              remarks: values.remarks,
            },
            {
              onSuccess: () => setEditTarget(null),
            }
          );
        }}
      />
    </Card>
  );
}

function Legend({ legend }: { legend?: Record<string, string> }) {
  const entries = Object.entries(legend ?? {}).filter(([code]) => code !== "-" && code !== "NJ");
  if (!entries.length) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {entries.map(([code, label]) => (
        <span key={code} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className={cn(
              "inline-flex h-4 w-5 items-center justify-center rounded text-[9px] font-semibold",
              CODE_STYLES[code as MusterCode] ?? "bg-muted"
            )}
          >
            {code}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}
