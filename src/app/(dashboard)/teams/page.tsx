"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { TeamsPage } from "@/features/teams/teams-page";

export default function TeamsRoutePage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <TeamsPage />
    </RoleGuard>
  );
}
