"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { BreadcrumbItem } from "@/types/navigation";

const ROUTE_LABELS: Record<string, string> = {
  owner: "Owner Dashboard",
  hr: "HR Dashboard",
  manager: "Manager Dashboard",
  employee: "Employee Dashboard",
  analytics: "Analytics",
  employees: "Employees",
  companies: "Companies",
  departments: "Departments",
  designations: "Designations",
  import: "Import",
  new: "New",
  edit: "Edit",
  attendance: "Attendance",
  reports: "Reports",
  shifts: "Shifts",
  regularization: "Regularization",
  geofencing: "Geofencing",
  leave: "Leave",
  "comp-off": "Comp-off",
  add: "Add Leave Balance",
  notifications: "Notifications",
  admin: "Administration",
  settings: "Settings",
  live: "Live Locations",
  organization: "Organization",
  teams: "Teams",
  "audit-logs": "Audit Logs",
  wfh: "Work From Home",
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({
        label,
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    });

    return items;
  }, [pathname]);
}
