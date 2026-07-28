import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: "default" | "success" | "warning" | "error";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusColors = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {index < items.length - 1 && (
            <div className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border" />
          )}
          <div
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
              statusColors[item.status ?? "default"]
            )}
          >
            {item.icon ?? (
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            )}
          </div>
          <div className="flex-1 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {item.timestamp}
              </time>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
