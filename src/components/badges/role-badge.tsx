import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/constants/roles";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

const roleVariants: Record<UserRole, string> = {
  owner: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  hr: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  manager: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  employee: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", roleVariants[role], className)}>
      {ROLES[role]}
    </Badge>
  );
}
