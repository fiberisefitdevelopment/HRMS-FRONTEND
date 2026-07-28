import { APP_CONFIG } from "@/config/app";

export function AppFooter() {
  return (
    <footer className="border-t bg-background px-4 py-3 lg:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
        </p>
        <p>Version {APP_CONFIG.version}</p>
      </div>
    </footer>
  );
}
