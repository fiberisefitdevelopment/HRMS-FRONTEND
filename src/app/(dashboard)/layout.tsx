import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
