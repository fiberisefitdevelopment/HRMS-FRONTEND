import {
  detectPunchSource,
  getCurrentPosition,
  GeolocationError,
  type GeoPosition,
} from "@/lib/geo/get-current-position";
import type { PunchPayload } from "@/types/attendance";
import type { GeofencingPolicyConfig } from "@/types/geofence";

export function isEmployeeInGeofenceScope(
  geofencing: GeofencingPolicyConfig | null | undefined,
  employeeProfileId?: string | null
): boolean {
  if (!geofencing?.enabled) return false;
  if (geofencing.applyToAllEmployees !== false) return true;
  if (!employeeProfileId) return false;
  return (geofencing.employeeProfileIds ?? []).includes(String(employeeProfileId));
}

export async function buildPunchPayload(options?: {
  geofencing?: GeofencingPolicyConfig | null;
  action?: "punch_in" | "punch_out";
  employeeProfileId?: string | null;
}): Promise<PunchPayload> {
  const source = detectPunchSource();
  const geofencing = options?.geofencing;
  const action = options?.action ?? "punch_in";
  const inScope = isEmployeeInGeofenceScope(geofencing, options?.employeeProfileId);

  const enforce =
    inScope &&
    (action === "punch_out"
      ? geofencing?.enforceOnPunchOut !== false
      : geofencing?.enforceOnPunchIn !== false);

  // Policy unknown (employees often lack policy.read): try GPS, punch with or without coords.
  // Policy known + not in scope / disabled: skip GPS.
  // Policy known + enforce: GPS required.
  if (geofencing && !geofencing.enabled) {
    return { source };
  }

  if (geofencing && !enforce) {
    return { source };
  }

  try {
    const position = await getCurrentPosition();
    return {
      source,
      latitude: position.latitude,
      longitude: position.longitude,
      accuracyMeters: position.accuracyMeters,
    };
  } catch (error) {
    if (enforce) {
      if (error instanceof GeolocationError) throw error;
      throw new GeolocationError("unknown", "Location is required to punch when geofencing is enabled");
    }
    return { source };
  }
}

export async function getOptionalPosition(): Promise<GeoPosition | null> {
  try {
    return await getCurrentPosition({ timeoutMs: 8_000 });
  } catch {
    return null;
  }
}
