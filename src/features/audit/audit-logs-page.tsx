"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogsQuery } from "@/hooks/queries/use-audit-queries";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { getErrorMessage } from "@/services/api/error-handler";
import type { AuditLogEntry } from "@/types/audit";

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "punch_in", label: "Punch in" },
  { value: "punch_out", label: "Punch out" },
  { value: "attendance_correct", label: "Attendance correct" },
  { value: "leave_apply", label: "Leave apply" },
  { value: "leave_approve", label: "Leave approve" },
  { value: "leave_reject", label: "Leave reject" },
  { value: "leave_cancel", label: "Leave cancel" },
  { value: "comp_off_raise", label: "Comp-off raise" },
  { value: "comp_off_approve", label: "Comp-off approve" },
  { value: "comp_off_reject", label: "Comp-off reject" },
  { value: "workflow_approve", label: "Workflow approve" },
  { value: "workflow_reject", label: "Workflow reject" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
];

function displayName(user?: AuditLogEntry["actor"] | null) {
  if (!user) return "—";
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "—"
  );
}

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLogsPage() {
  const { page, pageSize, setPage } = useServerListState(20);
  const { hasRole } = usePermissions();
  const showActorColumns = hasRole(["hr", "owner", "manager"]);
  const [action, setAction] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt",
      ...(action !== "all" ? { action } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [page, pageSize, action, dateFrom, dateTo]
  );

  const { data, isLoading, isError, error } = useAuditLogsQuery(params);

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(() => {
    const cols: ColumnDef<AuditLogEntry>[] = [
      {
        accessorKey: "createdAt",
        header: "When",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">{formatWhen(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize font-normal">
            {formatAction(row.original.action)}
          </Badge>
        ),
      },
    ];

    if (showActorColumns) {
      cols.push({
        id: "actor",
        header: "Performed by",
        cell: ({ row }) => (
          <span className="text-sm">{displayName(row.original.actor)}</span>
        ),
      });
    }

    cols.push(
      {
        id: "subject",
        header: "For",
        cell: ({ row }) => {
          const subject = displayName(row.original.subject);
          if (subject !== "—") return <span className="text-sm">{subject}</span>;
          return (
            <span className="text-sm text-muted-foreground">
              {displayName(row.original.actor)}
            </span>
          );
        },
      },
      {
        accessorKey: "entityType",
        header: "Entity",
        cell: ({ row }) => (
          <span className="capitalize text-sm text-muted-foreground">
            {row.original.entityType?.replace(/_/g, " ") || "—"}
          </span>
        ),
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => {
          const meta = row.original.metadata ?? {};
          const changes = row.original.changes;
          const bits: string[] = [];
          if (typeof meta.status === "string") bits.push(`Status: ${meta.status}`);
          if (
            changes &&
            typeof changes === "object" &&
            changes.before &&
            changes.after &&
            typeof changes.before === "object" &&
            typeof changes.after === "object"
          ) {
            const beforeStatus = (changes.before as { attendanceStatus?: string }).attendanceStatus;
            const afterStatus = (changes.after as { attendanceStatus?: string }).attendanceStatus;
            if (beforeStatus && afterStatus && beforeStatus !== afterStatus) {
              bits.push(`${beforeStatus} → ${afterStatus}`);
            }
          }
          if (typeof meta.date === "string" && meta.date) bits.push(meta.date);
          if (typeof meta.comment === "string" && meta.comment) bits.push(meta.comment);
          if (typeof meta.reason === "string" && meta.reason) bits.push(meta.reason);
          if (typeof meta.lateByMinutes === "number" && meta.lateByMinutes > 0) {
            bits.push(`Late ${meta.lateByMinutes}m`);
          }
          if (typeof meta.netWorkingMinutes === "number") {
            bits.push(`Net ${meta.netWorkingMinutes}m`);
          }
          return (
            <span className="line-clamp-2 max-w-[240px] text-sm text-muted-foreground">
              {bits.length ? bits.join(" · ") : "—"}
            </span>
          );
        },
      }
    );

    return cols;
  }, [showActorColumns]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Action</Label>
          <Select
            value={action}
            onValueChange={(v) => {
              setAction(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        onPageChange={setPage}
        enableSearch={false}
        emptyMessage="No audit logs yet. Actions performed in your company will appear here."
      />
    </div>
  );
}
