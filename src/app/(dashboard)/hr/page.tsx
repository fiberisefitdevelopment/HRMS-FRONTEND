import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/feedback/skeletons";
import { RoleGuard } from "@/components/guards/role-guard";

const HRDashboard = dynamic(
  () => import("@/components/dashboard/hr-dashboard").then((m) => m.HRDashboard),
  { loading: () => <DashboardSkeleton /> }
);

export default function HRPage() {
  return (
    <RoleGuard allowedRoles={["owner", "hr"]}>
      <HRDashboard />
    </RoleGuard>
  );
}
