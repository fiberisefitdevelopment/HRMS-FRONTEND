"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Pin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSidebarStore } from "@/store/sidebar-store";
import type { NavGroup, NavItem } from "@/types/navigation";
import { NAV_GROUP_LABELS, NAV_GROUP_ORDER } from "@/types/navigation";

interface SidebarNavProps {
  items: NavItem[];
  collapsed?: boolean;
}

function NavItemActions({ itemId, collapsed }: { itemId: string; collapsed?: boolean }) {
  const { togglePin, toggleFavorite, isPinned, isFavorite } = useSidebarStore();

  if (collapsed) return null;

  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePin(itemId);
        }}
        className="rounded p-0.5 hover:text-foreground"
        aria-label={isPinned(itemId) ? "Unpin" : "Pin"}
      >
        <Pin className={cn("h-3 w-3", isPinned(itemId) && "fill-current")} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(itemId);
        }}
        className="rounded p-0.5 hover:text-foreground"
        aria-label={isFavorite(itemId) ? "Remove from favorites" : "Add to favorites"}
      >
        <Star className={cn("h-3 w-3", isFavorite(itemId) && "fill-current text-warning")} />
      </button>
    </div>
  );
}

function NavItemLabel({
  item,
  collapsed,
  depth = 0,
  showChevron = false,
}: {
  item: NavItem;
  collapsed?: boolean;
  depth?: number;
  showChevron?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        depth > 0 && "ml-4"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      {showChevron && !collapsed && (
        <ChevronRight className="ml-1 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      )}
    </div>
  );
}

function NavItemComponent({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed?: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  if (hasChildren && !collapsed) {
    return (
      <Collapsible defaultOpen={isActive}>
        <div className="flex w-full items-center">
          <CollapsibleTrigger asChild>
            <button type="button" className="group min-w-0 flex-1 text-left">
              <NavItemLabel item={item} collapsed={collapsed} depth={depth} showChevron />
            </button>
          </CollapsibleTrigger>
          <NavItemActions itemId={item.id} collapsed={collapsed} />
        </div>
        <CollapsibleContent className="space-y-1 pt-1">
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const link = (
    <div className="group flex w-full items-center">
      <Link href={item.href} className="min-w-0 flex-1">
        <NavItemLabel item={item} collapsed={collapsed} depth={depth} />
      </Link>
      <NavItemActions itemId={item.id} collapsed={collapsed} />
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} className="block">
            <NavItemLabel item={item} collapsed={collapsed} depth={depth} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function GroupLabel({ label, collapsed }: { label: string; collapsed?: boolean }) {
  if (!label) return null;
  if (collapsed) return <Separator className="my-2" />;
  return (
    <p className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {label}
    </p>
  );
}

export function SidebarNav({ items, collapsed }: SidebarNavProps) {
  const { pinnedItems } = useSidebarStore();

  const pinnedNavItems = items.filter((item) => pinnedItems.includes(item.id));
  const regularItems = items.filter((item) => !pinnedItems.includes(item.id));

  const groupedItems = NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: regularItems.filter((item) => (item.group ?? "main") === group),
  })).filter((section) => section.items.length > 0);

  const ungrouped = regularItems.filter(
    (item) => !NAV_GROUP_ORDER.includes((item.group ?? "main") as NavGroup)
  );

  return (
    <TooltipProvider delayDuration={0}>
      <ScrollArea className="flex-1 px-3 py-2">
        {pinnedNavItems.length > 0 && (
          <div className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pinned
              </p>
            )}
            <div className="space-y-1">
              {pinnedNavItems.map((item) => (
                <NavItemComponent key={item.id} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        )}

        {groupedItems.length === 0 && ungrouped.length === 0 ? (
          !collapsed && (
            <p className="px-3 py-4 text-xs text-muted-foreground">No menu items available</p>
          )
        ) : (
          <>
            {groupedItems.map((section) => (
              <div key={section.group} className="space-y-1">
                <GroupLabel label={section.label} collapsed={collapsed} />
                {section.items.map((item) => (
                  <NavItemComponent key={item.id} item={item} collapsed={collapsed} />
                ))}
              </div>
            ))}
            {ungrouped.length > 0 && (
              <div className="space-y-1">
                {ungrouped.map((item) => (
                  <NavItemComponent key={item.id} item={item} collapsed={collapsed} />
                ))}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </TooltipProvider>
  );
}
