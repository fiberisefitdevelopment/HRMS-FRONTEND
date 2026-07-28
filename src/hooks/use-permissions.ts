"use client";

import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/auth";

export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const user = useAuthStore((s) => s.user);

  const hasPermission = useCallback(
    (permission: string) => {
      if (user?.role === "owner") return true;
      return permissions.includes(permission);
    },
    [permissions, user?.role]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => perms.some((p) => hasPermission(p)),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]) => perms.every((p) => hasPermission(p)),
    [hasPermission]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  return { permissions, permissionSet, hasPermission, hasAnyPermission, hasAllPermissions, hasRole };
}
