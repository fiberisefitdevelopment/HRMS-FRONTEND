"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { TeamLeavePage } from "@/features/teams/team-leave-page";

export default function TeamLeaveRoutePage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <TeamLeavePage />
    </RoleGuard>
  );
}
