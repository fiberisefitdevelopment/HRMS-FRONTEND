"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { PermissionProvider } from "./permission-provider";
import { CompanyProvider } from "./company-provider";
import { NotificationProvider } from "./notification-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <CompanyProvider>
              <NotificationProvider>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </NotificationProvider>
            </CompanyProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
