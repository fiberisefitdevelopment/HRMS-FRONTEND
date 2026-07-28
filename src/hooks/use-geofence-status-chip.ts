"use client";

import { useEffect, useState } from "react";
import { geofenceService } from "@/services/geofence/geofence.service";
import { getOptionalPosition } from "@/lib/geo/build-punch-payload";
import type { ValidateGeofenceResult } from "@/types/geofence";

export type GeofenceChipState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "inside"; distanceMeters: number | null }
  | { status: "outside"; distanceMeters: number | null; officeName?: string };

/**
 * Optional Inside/Outside chip when geofencing is enabled.
 * Uses validate endpoint + current GPS (best-effort).
 */
export function useGeofenceStatusChip(enabled: boolean): GeofenceChipState {
  const [state, setState] = useState<GeofenceChipState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;

    const run = async () => {
      setState({ status: "loading" });
      const position = await getOptionalPosition();
      if (cancelled) return;
      if (!position) {
        setState({ status: "unavailable" });
        return;
      }

      try {
        const result: ValidateGeofenceResult = await geofenceService.validate({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        if (cancelled) return;
        if (result.allowed) {
          setState({ status: "inside", distanceMeters: result.distanceMeters });
        } else {
          setState({
            status: "outside",
            distanceMeters: result.distanceMeters,
            officeName: result.nearestOffice?.name,
          });
        }
      } catch {
        if (!cancelled) setState({ status: "unavailable" });
      }
    };

    void run();
    const interval = window.setInterval(() => void run(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  return state;
}
