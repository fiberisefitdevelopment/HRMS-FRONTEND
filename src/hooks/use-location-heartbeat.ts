"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance/attendance.service";
import { getCurrentPosition } from "@/lib/geo/get-current-position";
import { hasOpenPunchSession } from "@/lib/attendance/punch-state";
import type { AttendanceToday } from "@/types/attendance";

const HEARTBEAT_INTERVAL_MS = 75_000;

/**
 * Sends location heartbeats while an open punch session exists.
 * Pauses when the tab is hidden; stops on punch-out.
 */
export function useLocationHeartbeat(todayAttendance?: AttendanceToday | null) {
  const isOpen = hasOpenPunchSession(todayAttendance);
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const position = await getCurrentPosition({ timeoutMs: 10_000, enableHighAccuracy: false });
      return attendanceService.updateLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracyMeters,
      });
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    const send = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (inFlight.current || mutation.isPending) return;
      inFlight.current = true;
      try {
        await mutation.mutateAsync();
      } catch {
        // Soft-fail: heartbeat must not interrupt the user.
      } finally {
        inFlight.current = false;
      }
    };

    void send();
    const interval = window.setInterval(() => void send(), HEARTBEAT_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void send();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on session open only
  }, [isOpen]);
}
