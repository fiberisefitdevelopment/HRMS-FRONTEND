"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { TeamLivePage } from "@/features/teams/team-live-page";

export default function TeamLiveRoutePage() {
  return (
    <PermissionGuard permissions={["attendance.dashboard", "geofence.read"]} requireAll>
      <TeamLivePage />
    </PermissionGuard>
  );
}
