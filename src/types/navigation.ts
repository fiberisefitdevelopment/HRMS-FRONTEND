import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./auth";

export type NavGroup = "main" | "manage" | "me" | "company" | "system";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  group?: NavGroup;
  roles?: UserRole[];
  permissions?: string[];
  badge?: string | number;
  children?: NavItem[];
  isPinned?: boolean;
  isFavorite?: boolean;
  comingSoon?: boolean;
}

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  main: "",
  manage: "Manage",
  me: "My Space",
  company: "Organization",
  system: "System",
};

export const NAV_GROUP_ORDER: NavGroup[] = ["main", "manage", "me", "company", "system"];

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
