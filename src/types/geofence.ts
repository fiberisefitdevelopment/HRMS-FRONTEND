export interface GeofenceOfficeSummary {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  distanceMeters: number | null;
}

export interface Geofence {
  id: string;
  companyId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGeofencePayload {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string | null;
  isActive?: boolean;
}

export type UpdateGeofencePayload = Partial<CreateGeofencePayload>;

export interface ValidateGeofencePayload {
  latitude: number;
  longitude: number;
}

export interface ValidateGeofenceResult {
  allowed: boolean;
  distanceMeters: number | null;
  matchedOffice: GeofenceOfficeSummary | null;
  nearestOffice: GeofenceOfficeSummary | null;
}

export interface GeofencingPolicyConfig {
  enabled: boolean;
  enforceOnPunchIn: boolean;
  enforceOnPunchOut: boolean;
  /** Default true — enforce for all company employees */
  applyToAllEmployees: boolean;
  /** Used when applyToAllEmployees is false */
  employeeProfileIds: string[];
}

export interface AttendancePolicy {
  id: string;
  companyId: string;
  name: string;
  geofencing: GeofencingPolicyConfig;
  status?: string;
}

export type UpdateAttendancePolicyPayload = {
  geofencing?: Partial<GeofencingPolicyConfig>;
};
