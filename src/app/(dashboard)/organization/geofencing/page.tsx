"use client";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { GeofencingPage } from "@/features/geofencing/geofencing-page";

export default function GeofencingRoutePage() {
  return (
    <PermissionGuard permissions={["geofence.read", "geofence.manage"]}>
      <GeofencingPage />
    </PermissionGuard>
  );
}
