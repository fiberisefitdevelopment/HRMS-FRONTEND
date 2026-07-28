"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

type PermissionContextType = ReturnType<typeof usePermissions>;

const PermissionContext = createContext<PermissionContextType | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const permissions = usePermissions();
  return (
    <PermissionContext.Provider value={permissions}>{children}</PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within PermissionProvider");
  }
  return context;
}
