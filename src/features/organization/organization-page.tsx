"use client";

import Link from "next/link";
import {
  Building2,
  UserCog,
  CalendarClock,
  CalendarDays,
  GitBranch,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { usePermissions } from "@/hooks/use-permissions";

interface OrgLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  permissions: string[];
  comingSoon?: boolean;
}

const ORG_LINKS: OrgLink[] = [
  {
    href: "/companies",
    title: "Company",
    description: "Company profile, legal entities and branding",
    icon: Building2,
    permissions: ["company.read"],
  },
  {
    href: "/employees/departments",
    title: "Departments",
    description: "Organizational units and reporting structure",
    icon: Building2,
    permissions: ["department.read"],
  },
  {
    href: "/employees/designations",
    title: "Designations",
    description: "Job titles and role definitions",
    icon: UserCog,
    permissions: ["designation.read"],
  },
  {
    href: "/attendance/shifts",
    title: "Shifts",
    description: "Work shifts and scheduling",
    icon: CalendarClock,
    permissions: ["attendance.shift.manage"],
  },
  {
    href: "/organization/geofencing",
    title: "Geofencing",
    description: "Office locations and punch enforcement",
    icon: MapPin,
    permissions: ["geofence.read", "geofence.manage"],
  },
  {
    href: "/organization",
    title: "Holiday Calendar",
    description: "Company holidays and observances",
    icon: CalendarDays,
    permissions: ["leave.policy.read"],
    comingSoon: true,
  },
  {
    href: "/organization",
    title: "Workflows",
    description: "Approval chains and automation",
    icon: GitBranch,
    permissions: ["workflow.template.read"],
    comingSoon: true,
  },
  {
    href: "/organization",
    title: "Policies",
    description: "Attendance and leave policies, rule engine",
    icon: ShieldCheck,
    permissions: ["leave.policy.read"],
    comingSoon: true,
  },
];

export function OrganizationPage() {
  const { hasAnyPermission } = usePermissions();
  const visible = ORG_LINKS.filter((link) => hasAnyPermission(link.permissions));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Configure the structure that everything else is built on"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((link) => {
          const Icon = link.icon;
          const card = (
            <Card
              className={link.comingSoon ? "border-dashed opacity-70" : "transition-colors hover:bg-muted/40"}
            >
              <CardContent className="p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium">
                  {link.title}
                  {link.comingSoon && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (coming soon)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          );

          if (link.comingSoon) {
            return <div key={link.title}>{card}</div>;
          }

          return (
            <Link key={link.title} href={link.href}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
