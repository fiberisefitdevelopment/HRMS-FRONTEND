"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { AttendanceStatusBadge } from "./attendance-status-badge";
import { RegularizeAttendanceLink } from "@/features/regularization/regularize-attendance-link";
import { formatAttendanceDate, formatMinutes, formatPunchTime, getEmployeeDisplayName } from "@/lib/attendance/format";
import type { AttendanceRecord } from "@/types/attendance";

function canOfferRegularize(record: AttendanceRecord) {
  if (record.isRegularized) return false;
  const status = (record.attendanceStatus ?? record.status ?? "").toLowerCase();
  return status === "late" || (record.lateByMinutes != null && record.lateByMinutes > 0);
}

export function getAttendanceColumns(options?: {
  showRegularize?: boolean;
}): ColumnDef<AttendanceRecord>[] {
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatAttendanceDate(row.original.date),
    },
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => getEmployeeDisplayName(row.original),
    },
    {
      accessorKey: "punchIn",
      header: "Punch In",
      cell: ({ row }) => formatPunchTime(row.original.punchIn),
    },
    {
      accessorKey: "punchOut",
      header: "Punch Out",
      cell: ({ row }) => formatPunchTime(row.original.punchOut),
    },
    {
      accessorKey: "netWorkingMinutes",
      header: "Net Hours",
      cell: ({ row }) => formatMinutes(row.original.netWorkingMinutes),
    },
    {
      accessorKey: "lateByMinutes",
      header: "Late By",
      cell: ({ row }) => formatMinutes(row.original.lateByMinutes),
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => row.original.shift?.name ?? "—",
    },
    {
      accessorKey: "attendanceStatus",
      header: "Status",
      cell: ({ row }) => (
        <AttendanceStatusBadge
          status={row.original.attendanceStatus}
          lateByMinutes={row.original.lateByMinutes}
          isRegularized={row.original.isRegularized}
        />
      ),
    },
  ];

  if (options?.showRegularize !== false) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (!canOfferRegularize(row.original)) return null;
        return <RegularizeAttendanceLink date={row.original.date} label="Regularize" />;
      },
    });
  }

  return columns;
}
