import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground max-w-md">
        You don&apos;t have permission to access this resource. Contact your administrator if you believe this is an error.
      </p>
      <Link
        href={ROUTES.owner}
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
