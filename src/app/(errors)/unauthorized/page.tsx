import Link from "next/link";
import { ShieldX } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <ShieldX className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="text-muted-foreground max-w-md">
        You need to be signed in to access this page.
      </p>
      <Link
        href={ROUTES.login}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        Sign in
      </Link>
    </div>
  );
}
