"use client";

import { PageHeader } from "@/components/layout/page-header";
import { HolidaysPage } from "@/features/holidays/holidays-page";

export default function HolidaysRoutePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Holidays"
        description="Upcoming observances first, then holidays that have already passed"
      />
      <HolidaysPage />
    </div>
  );
}
