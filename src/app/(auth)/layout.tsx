import { GuestGuard } from "@/components/guards/auth-guard";
import { AuthLayout } from "@/layouts/auth-layout";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
