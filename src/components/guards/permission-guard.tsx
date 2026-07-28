"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { ROUTES } from "@/config/routes";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  requireAll?: boolean;
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  const router = useRouter();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  useEffect(() => {
    if (!hasAccess) {
      router.replace(ROUTES.forbidden);
    }
  }, [hasAccess, router]);

  if (!hasAccess) return null;

  return <>{children}</>;
}

export function Can({
  permission,
  permissions,
  requireAll,
  children,
  fallback = null,
}: {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const perms = permission ? [permission] : (permissions ?? []);
  const allowed = requireAll
    ? hasAllPermissions(perms)
    : perms.length === 1
      ? hasPermission(perms[0])
      : hasAnyPermission(perms);

  return allowed ? children : fallback;
}
