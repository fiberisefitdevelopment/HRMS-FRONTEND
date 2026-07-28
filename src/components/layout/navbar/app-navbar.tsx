"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Clock,
  ExternalLink,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Plus,
  Command,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useAuthStore } from "@/store/auth-store";
import { useCompanyStore } from "@/store/company-store";
import { useNotificationStore } from "@/store/notification-store";
import { useIsMobile } from "@/hooks/use-media-query";
import { useSidebarStore } from "@/store/sidebar-store";
import { PanelLeft } from "lucide-react";
import { CompanyBadge } from "@/components/badges/company-badge";
import { CommandPalette } from "@/components/layout/command-palette";
import { useLogoutMutation, useSwitchCompanyMutation } from "@/hooks/mutations/use-auth-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { ROUTES } from "@/config/routes";
import Link from "next/link";
import { useAttendanceTodayQuery } from "@/hooks/queries/use-attendance-queries";
import { useGeofencedPunch } from "@/hooks/use-geofenced-punch";
import { useLocationHeartbeat } from "@/hooks/use-location-heartbeat";
import { useGeofenceStatusChip } from "@/hooks/use-geofence-status-chip";
import { formatMinutes } from "@/lib/attendance/format";
import { formatLeaveDate } from "@/lib/leave/format";
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from "@/hooks/mutations/use-notification-mutations";
import { getFirstPunchIn, hasOpenPunchSession } from "@/lib/attendance/punch-state";
import { Badge } from "@/components/ui/badge";

export function AppNavbar() {
  const breadcrumbs = useBreadcrumbs();
  const user = useAuthStore((s) => s.user);
  const companies = useCompanyStore((s) => s.companies);
  const companiesLoading = useCompanyStore((s) => s.isLoading);
  const notifications = useNotificationStore((s) => s.notifications);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { setMobileOpen } = useSidebarStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const logoutMutation = useLogoutMutation();
  const switchCompanyMutation = useSwitchCompanyMutation();
  const { data: todayAttendance, isLoading: isTodayLoading } = useAttendanceTodayQuery();
  const { punchIn, punchOut, isPunchingIn, isPunchingOut, geofencingEnabled, policyLoaded } =
    useGeofencedPunch();
  useLocationHeartbeat(todayAttendance);
  const markNotificationRead = useMarkNotificationReadMutation();
  const markAllNotificationsRead = useMarkAllNotificationsReadMutation();
  const { hasPermission } = usePermissions();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const canSwitchCompany = hasPermission("company.switch");
  const canPunch = user?.role !== "owner" && hasPermission("attendance.punch");
  const showGeofenceChip = Boolean(canPunch && (!policyLoaded || geofencingEnabled));
  const geofenceChip = useGeofenceStatusChip(showGeofenceChip);
  const isOpenSession = hasOpenPunchSession(todayAttendance);
  const firstPunchIn = getFirstPunchIn(todayAttendance);
  const isPunchInDisabled = isTodayLoading || isOpenSession || isPunchingIn;
  const isPunchOutDisabled = isTodayLoading || !isOpenSession || isPunchingOut;
  const shouldShowTimer = Boolean(canPunch && isOpenSession && firstPunchIn?.timestamp);
  const runningMinutes = useMemo(() => {
    if (!shouldShowTimer || !firstPunchIn?.timestamp) return null;
    const punchInTime = new Date(firstPunchIn.timestamp).getTime();
    if (Number.isNaN(punchInTime)) return null;
    return Math.max(0, Math.floor((nowMs - punchInTime) / 60000));
  }, [nowMs, shouldShowTimer, firstPunchIn?.timestamp]);
  const activeCompanyId = user?.company?.id;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "U";

  useEffect(() => {
    if (!shouldShowTimer) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [shouldShowTimer]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <span key={item.label} className="flex items-center gap-1.5">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          {canPunch && showGeofenceChip && geofenceChip.status !== "idle" && (
            <Badge
              variant={
                geofenceChip.status === "inside"
                  ? "success"
                  : geofenceChip.status === "outside"
                    ? "warning"
                    : "secondary"
              }
              className="hidden max-w-[160px] truncate sm:inline-flex"
              title={
                geofenceChip.status === "outside" && geofenceChip.officeName
                  ? `Nearest: ${geofenceChip.officeName}`
                  : undefined
              }
            >
              {geofenceChip.status === "loading" && "Checking location…"}
              {geofenceChip.status === "inside" && "Inside geofence"}
              {geofenceChip.status === "outside" && "Outside geofence"}
              {geofenceChip.status === "unavailable" && "Location unavailable"}
            </Badge>
          )}

          {canPunch && !isOpenSession && (
            <>
              <Button
                size="icon"
                className="sm:hidden"
                onClick={() => void punchIn()}
                disabled={isPunchInDisabled}
                isLoading={isPunchingIn}
                aria-label="Punch in"
              >
                <LogIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="hidden sm:flex gap-2"
                onClick={() => void punchIn()}
                disabled={isPunchInDisabled}
                isLoading={isPunchingIn}
              >
                <LogIn className="h-4 w-4" />
                Punch In
              </Button>
            </>
          )}

          {canPunch && isOpenSession && (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="sm:hidden"
                onClick={() => void punchOut()}
                disabled={isPunchOutDisabled}
                isLoading={isPunchingOut}
                aria-label="Punch out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="hidden sm:flex gap-2"
                onClick={() => void punchOut()}
                disabled={isPunchOutDisabled}
                isLoading={isPunchingOut}
              >
                <LogOut className="h-4 w-4" />
                Punch Out
              </Button>
              {runningMinutes != null && (
                <div className="flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground sm:px-2.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatMinutes(runningMinutes)}
                </div>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 text-muted-foreground w-48 justify-start"
            onClick={() => setCommandOpen(true)}
          >
            <Command className="h-3.5 w-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button variant="outline" size="icon" className="hidden sm:flex" aria-label="Quick actions">
            <Plus className="h-4 w-4" />
          </Button>

          {canSwitchCompany && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex gap-2 max-w-[200px]"
                  disabled={switchCompanyMutation.isPending}
                >
                  {switchCompanyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : user?.company ? (
                    <CompanyBadge name={user.company.name} logo={user.company.logo} size="sm" />
                  ) : (
                    <span className="text-sm">Select company</span>
                  )}
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companiesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : companies.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No companies available
                  </div>
                ) : (
                  companies.map((company) => (
                    <DropdownMenuItem
                      key={company.id}
                      onSelect={(event) => {
                        event.preventDefault();
                        if (!company.id) return;
                        if (switchCompanyMutation.isPending) return;
                        switchCompanyMutation.mutate({
                          companyId: company.id,
                          candidateCompanyIds: [company._id, company.companyId].filter(Boolean) as string[],
                          companyName: company.companyName,
                        });
                      }}
                      disabled={switchCompanyMutation.isPending}
                      className={cn(company.id === activeCompanyId && "bg-accent")}
                    >
                      <CompanyBadge name={company.companyName} logo={company.logo} size="sm" />
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => markAllNotificationsRead.mutate()}
                    isLoading={markAllNotificationsRead.isPending}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto p-2">
                  {notifications.slice(0, 8).map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.href ?? ROUTES.approvals}
                      className={cn(
                        "block rounded-md border p-2.5 text-sm transition-colors hover:bg-muted/50",
                        !notification.read && "border-primary/40 bg-primary/5"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markNotificationRead.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{notification.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatLeaveDate(notification.createdAt)}
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary">
                        Open Approvals <ExternalLink className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.approvals} className="justify-center text-xs">
                      View all in Approvals
                    </Link>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.profilePhoto && <AvatarImage src={user.profilePhoto} alt={user.firstName} />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.fullName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.profile}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.settings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-destructive"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
