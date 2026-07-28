import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground text-primary font-bold text-lg">
              H
            </div>
            <span className="text-2xl font-bold">HRMS</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Enterprise Human Resource Management
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Streamline your workforce management with a modern, intuitive platform built for scale.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Trusted by 500+ enterprises worldwide
        </p>
      </div>
      <div className={cn("flex items-center justify-center p-6 sm:p-12")}>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
