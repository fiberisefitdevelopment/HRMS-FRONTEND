"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePunchInMutation, usePunchOutMutation } from "@/hooks/mutations/use-attendance-mutations";
import { useAttendancePolicyQuery } from "@/hooks/queries/use-geofence-queries";
import { useEmployeeMeQuery } from "@/hooks/queries/use-employees-queries";
import { buildPunchPayload, isEmployeeInGeofenceScope } from "@/lib/geo/build-punch-payload";
import { GeolocationError } from "@/lib/geo/get-current-position";

export function useGeofencedPunch() {
  const { data: policy } = useAttendancePolicyQuery();
  const { data: me } = useEmployeeMeQuery();
  const punchInMutation = usePunchInMutation();
  const punchOutMutation = usePunchOutMutation();
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  const employeeProfileId = me?.id;
  const geofencingEnabled = isEmployeeInGeofenceScope(policy?.geofencing, employeeProfileId);

  const punchIn = useCallback(async () => {
    setIsResolvingLocation(true);
    try {
      const payload = await buildPunchPayload({
        geofencing: policy?.geofencing ?? null,
        action: "punch_in",
        employeeProfileId,
      });
      await punchInMutation.mutateAsync(payload);
    } catch (error) {
      if (error instanceof GeolocationError) {
        toast.error(error.message);
      }
    } finally {
      setIsResolvingLocation(false);
    }
  }, [policy?.geofencing, employeeProfileId, punchInMutation]);

  const punchOut = useCallback(async () => {
    setIsResolvingLocation(true);
    try {
      const payload = await buildPunchPayload({
        geofencing: policy?.geofencing ?? null,
        action: "punch_out",
        employeeProfileId,
      });
      await punchOutMutation.mutateAsync(payload);
    } catch (error) {
      if (error instanceof GeolocationError) {
        toast.error(error.message);
      }
    } finally {
      setIsResolvingLocation(false);
    }
  }, [policy?.geofencing, employeeProfileId, punchOutMutation]);

  return {
    punchIn,
    punchOut,
    isPunchingIn: punchInMutation.isPending || isResolvingLocation,
    isPunchingOut: punchOutMutation.isPending || isResolvingLocation,
    geofencingEnabled,
    policyLoaded: Boolean(policy),
  };
}
