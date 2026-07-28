"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { ROUTES } from "@/config/routes";
import { useRegularizationDialogStore } from "@/store/regularization-dialog-store";

function RegularizationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openForDate = useRegularizationDialogStore((s) => s.openForDate);

  useEffect(() => {
    const date = searchParams.get("date");
    const tab = searchParams.get("tab");

    if (tab === "requests") {
      router.replace(`${ROUTES.leave}?tab=history`);
      return;
    }

    if (date) {
      openForDate(date);
      router.replace(ROUTES.attendance);
      return;
    }

    router.replace(ROUTES.leave);
  }, [openForDate, router, searchParams]);

  return <PageLoader />;
}

/** Legacy route — regularization now opens from calendar dialog; history lives under Leave. */
export default function AttendanceRegularizationRoutePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegularizationRedirect />
    </Suspense>
  );
}
