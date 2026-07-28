import { PERMISSION_LABELS } from "@/config/permissions";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionBadgeProps {
  permission: string;
  className?: string;
}

export function PermissionBadge({ permission, className }: PermissionBadgeProps) {
  const label = PERMISSION_LABELS[permission] ?? permission.replace(/\./g, " · ");

  return (
    <Badge variant="outline" className={cn("gap-1 font-normal", className)}>
      <Shield className="h-3 w-3" />
      {label}
    </Badge>
  );
}
