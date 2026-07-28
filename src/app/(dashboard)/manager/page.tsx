import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/feedback/skeletons";
import { RoleGuard } from "@/components/guards/role-guard";

const ManagerDashboard = dynamic(
  () => import("@/components/dashboard/manager-dashboard").then((m) => m.ManagerDashboard),
  { loading: () => <DashboardSkeleton /> }
);

export default function ManagerPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerDashboard />
    </RoleGuard>
  );
}
