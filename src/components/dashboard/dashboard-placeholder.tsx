import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";

interface DashboardPlaceholderProps {
  title: string;
  description?: string;
}

export function DashboardPlaceholder({ title, description }: DashboardPlaceholderProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title={title}
      description={
        description ??
        "Dashboard metrics will appear here once the corresponding module APIs are connected."
      }
      className="min-h-[320px] justify-center"
    />
  );
}
