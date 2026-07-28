import { Badge } from "@/components/ui/badge";
import type { EmployeeStatus } from "@/types/employee";

const statusVariants: Record<EmployeeStatus, "success" | "secondary" | "warning" | "destructive" | "outline"> = {
  active: "success",
  inactive: "secondary",
  terminated: "destructive",
  on_leave: "warning",
  resigned: "outline",
};

const statusLabels: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  terminated: "Terminated",
  on_leave: "On Leave",
  resigned: "Resigned",
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge variant={statusVariants[status] ?? "secondary"}>
      {statusLabels[status] ?? status}
    </Badge>
  );
}
