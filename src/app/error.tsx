"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">500</h1>
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-xl overflow-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
          {error.message}
        </pre>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
