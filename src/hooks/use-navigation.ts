"use client";

import { useMemo } from "react";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { ROLE_ROUTES } from "@/config/routes";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth-store";
import type { NavItem } from "@/types/navigation";
import type { UserRole } from "@/types/auth";

function filterNavItem(
  item: NavItem,
  hasRole: (role: UserRole | UserRole[]) => boolean,
  hasAnyPermission: (perms: string[]) => boolean,
  role?: UserRole
): NavItem | null {
  if (item.roles && role && !item.roles.includes(role)) return null;
  if (item.roles && !role && !hasRole(item.roles)) return null;
  if (item.permissions?.length && !hasAnyPermission(item.permissions)) return null;

  const children = item.children
    ?.map((child) => filterNavItem(child, hasRole, hasAnyPermission, role))
    .filter((child): child is NavItem => child !== null);

  if (item.children?.length && children?.length === 0) return null;

  return { ...item, children: children?.length ? children : undefined };
}

export function useNavigation() {
  const user = useAuthStore((s) => s.user);
  const { hasRole, hasAnyPermission } = usePermissions();

  const items = useMemo(() => {
    const role = user?.role;
    const dashboardHref = role ? ROLE_ROUTES[role] : "/login";

    return NAVIGATION_ITEMS.map((item) => {
      if (item.id === "dashboard" && role) {
        return { ...item, href: dashboardHref };
      }
      return item;
    })
      .map((item) => filterNavItem(item, hasRole, hasAnyPermission, role))
      .filter((item): item is NavItem => item !== null);
  }, [user?.role, hasRole, hasAnyPermission]);

  return { items, user };
}
