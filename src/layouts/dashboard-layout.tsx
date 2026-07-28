"use client";

import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { AppNavbar } from "@/components/layout/navbar/app-navbar";
import { AppFooter } from "@/components/layout/footer/app-footer";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { RaiseRegularizationDialog } from "@/features/regularization/raise-regularization-dialog";
import { RaiseCompOffDialog } from "@/features/comp-off/raise-comp-off-dialog";
import { ApplyLeaveDialog } from "@/features/leave/apply-leave-dialog";
import { useSidebarStore } from "@/store/sidebar-store";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={isMobileOpen} onOpenChange={setMobileOpen}>
          <DrawerContent className="h-[85vh] p-0">
            <AppSidebar className="w-full border-0" />
          </DrawerContent>
        </Drawer>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppNavbar />
        <main className={cn("flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6")}>
          {children}
        </main>
        <AppFooter />
      </div>

      <RaiseRegularizationDialog />
      <RaiseCompOffDialog />
      <ApplyLeaveDialog />
    </div>
  );
}
