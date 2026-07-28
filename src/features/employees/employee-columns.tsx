"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { getEmployeeCategoryLabel } from "@/lib/employee/employment-category";
import { Badge } from "@/components/ui/badge";
import { getMediaUrl } from "@/lib/api/media-url";
import type { Employee } from "@/types/employee";
import { format } from "date-fns";

export function getEmployeeColumns(): ColumnDef<Employee>[] {
  return [
    {
      accessorKey: "fullName",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original;
        const initials = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "?";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {employee.profilePhoto && (
                <AvatarImage src={getMediaUrl(employee.profilePhoto)} alt={employee.fullName} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/employees/${employee.id}`}
                className="font-medium hover:underline"
              >
                {employee.fullName}
              </Link>
              <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => row.original.department?.name ?? "—",
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => row.original.designation?.name ?? "—",
    },
    {
      id: "employmentCategory",
      header: "Category",
      cell: ({ row }) => {
        const label = getEmployeeCategoryLabel(row.original);
        const isContractual = row.original.employmentType === "contract";
        return (
          <Badge variant={isContractual ? "secondary" : "outline"}>{label}</Badge>
        );
      },
    },
    {
      accessorKey: "manager",
      header: "Manager",
      cell: ({ row }) => row.original.manager?.fullName ?? "—",
    },
    {
      accessorKey: "joiningDate",
      header: "Joined",
      cell: ({ row }) =>
        row.original.joiningDate
          ? format(new Date(row.original.joiningDate), "dd MMM yyyy")
          : "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/employees/${row.original.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          View
        </Link>
      ),
    },
  ];
}
