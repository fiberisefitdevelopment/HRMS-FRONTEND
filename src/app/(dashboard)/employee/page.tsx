import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/feedback/skeletons";

const EmployeeDashboard = dynamic(
  () => import("@/components/dashboard/employee-dashboard").then((m) => m.EmployeeDashboard),
  { loading: () => <DashboardSkeleton /> }
);

export default function EmployeePage() {
  return <EmployeeDashboard />;
}
