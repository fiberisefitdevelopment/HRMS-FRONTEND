import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/feedback/skeletons";
import { RoleGuard } from "@/components/guards/role-guard";

const OwnerDashboard = dynamic(
  () => import("@/components/dashboard/owner-dashboard").then((m) => m.OwnerDashboard),
  { loading: () => <DashboardSkeleton /> }
);

export default function OwnerPage() {
  return (
    <RoleGuard allowedRoles={["owner"]}>
      <OwnerDashboard />
    </RoleGuard>
  );
}
