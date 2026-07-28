"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SearchInput } from "@/components/ui/search-input";
import { AppSidebarNav } from "./app-sidebar-nav";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { APP_CONFIG } from "@/config/app";
import { CompanyBadge } from "@/components/badges/company-badge";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "U";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-[68px]" : "w-[260px]",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              H
            </div>
            <span className="font-semibold text-lg">{APP_CONFIG.name}</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && user?.company && (
        <div className="px-4 pb-3">
          <CompanyBadge name={user.company.name} logo={user.company.logo} size="sm" />
        </div>
      )}

      {!isCollapsed && (
        <div className="px-4 pb-3">
          <SearchInput placeholder="Quick search..." className="h-8" />
        </div>
      )}

      <Separator />

      <AppSidebarNav collapsed={isCollapsed} />

      <Separator />

      {user && (
        <div className={cn("p-3", isCollapsed && "flex justify-center")}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="h-8 w-8">
              {user.profilePhoto && <AvatarImage src={user.profilePhoto} alt={user.firstName} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.designation ?? user.roleName ?? user.role}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
