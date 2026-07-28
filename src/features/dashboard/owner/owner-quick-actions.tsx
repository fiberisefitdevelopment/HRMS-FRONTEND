"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Can } from "@/components/guards/permission-guard";

interface OwnerQuickActionsProps {
  workforceTotal: number;
  pendingApprovals: number;
}

interface ActionItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  badge?: number;
  badgeTone?: "default" | "amber";
}

export function OwnerQuickActions({ workforceTotal, pendingApprovals }: OwnerQuickActionsProps) {
  const actions: ActionItem[] = [
    {
      href: "/employees",
      label: "People",
      icon: Users,
      permission: "employee.read",
      badge: workforceTotal,
    },
    {
      href: "/approvals",
      label: "Approvals",
      icon: ClipboardCheck,
      permission: "leave.approve",
      badge: pendingApprovals,
      badgeTone: pendingApprovals > 0 ? "amber" : "default",
    },
    {
      href: "/organization",
      label: "Organization",
      icon: Building2,
      permission: "company.read",
    },
    {
      href: "/attendance/reports",
      label: "Reports",
      icon: BarChart3,
      permission: "attendance.report",
    },
    {
      href: "/employees/new",
      label: "Add employee",
      icon: UserPlus,
      permission: "employee.create",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const link = (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "group inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-all",
              "hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow"
            )}
          >
            <action.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <span>{action.label}</span>
            {action.badge != null && action.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  action.badgeTone === "amber"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {action.badge}
              </span>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        );

        if (!action.permission) return link;

        return (
          <Can key={action.href} permission={action.permission}>
            {link}
          </Can>
        );
      })}
    </div>
  );
}
