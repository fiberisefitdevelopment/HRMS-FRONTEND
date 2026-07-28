"use client";

import Link from "next/link";
import { Bell, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotificationsQuery } from "@/hooks/queries/use-notification-queries";
import { useMarkAllNotificationsReadMutation } from "@/hooks/mutations/use-notification-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import { formatLeaveDate } from "@/lib/leave/format";
import { getNotificationHref } from "@/lib/notifications/href";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";

const TYPE_STYLES: Record<NotificationType, string> = {
  info: "border-l-blue-500 bg-blue-500/5",
  success: "border-l-emerald-500 bg-emerald-500/5",
  warning: "border-l-amber-500 bg-amber-500/5",
  error: "border-l-red-500 bg-red-500/5",
  action_required: "border-l-violet-500 bg-violet-500/5",
};

interface AnnouncementsPanelProps {
  limit?: number;
  className?: string;
}

export function AnnouncementsPanel({ limit = 5, className }: AnnouncementsPanelProps) {
  const { data, isLoading, isError, error } = useNotificationsQuery({ limit });
  const markAllRead = useMarkAllNotificationsReadMutation();

  const items = data?.data ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          Announcements
        </CardTitle>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            isLoading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <EmptyState
            icon={Bell}
            title="No announcements"
            description="Company updates and leave alerts will appear here."
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={getNotificationHref(item.actionUrl)}
                  className={cn(
                    "block rounded-lg border border-l-4 p-3 transition-colors hover:opacity-90",
                    TYPE_STYLES[item.type] ?? TYPE_STYLES.info,
                    !item.isRead && "ring-1 ring-primary/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", !item.isRead && "text-foreground")}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                    {!item.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatLeaveDate(item.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
