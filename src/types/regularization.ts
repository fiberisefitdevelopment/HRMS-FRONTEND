export type RegularizationStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface RegularizationPolicySnapshot {
  enabled?: boolean;
  windowStart?: string;
  windowEnd?: string;
  monthlyLimit?: number;
  exceedingAction?: string;
}

export interface RegularizationEligibility {
  date: string;
  policy?: RegularizationPolicySnapshot | null;
  windowDisplay?: string | null;
  punchInAt?: string | null;
  punchInDisplay?: string | null;
  lateByMinutes?: number | null;
  originalStatus?: string | null;
  usedThisMonth?: number;
  remaining?: number;
  inWindow?: boolean;
  isEligible: boolean;
  message?: string | null;
  hasExistingRequest?: boolean;
  existingRequestId?: string | null;
  existingStatus?: RegularizationStatus | string | null;
}

export interface RegularizationActor {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface RegularizationRequest {
  id: string;
  companyId?: string;
  employeeProfileId?: string;
  userId?: string;
  user?: {
    id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  employee?: {
    id?: string;
    employeeId?: string;
  };
  /** Canonical attendance date (YYYY-MM-DD). Filled from `date` or `attendanceDate`. */
  date: string;
  /** Some API responses use this instead of `date`. */
  attendanceDate?: string | null;
  reason: string;
  requestedPunchIn?: string | null;
  requestedPunchOut?: string | null;
  punchInAt?: string | null;
  punchOutAt?: string | null;
  punchInDisplay?: string | null;
  punchOutDisplay?: string | null;
  lateByMinutes?: number | null;
  originalStatus?: string | null;
  status: RegularizationStatus | string;
  appliedStatus?: string | null;
  windowDisplay?: string | null;
  policy?: RegularizationPolicySnapshot | null;
  comment?: string | null;
  rejectionComment?: string | null;
  cancelledReason?: string | null;
  approvedBy?: RegularizationActor | string | null;
  approvedByName?: string | null;
  rejectedBy?: RegularizationActor | string | null;
  rejectedByName?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RaiseRegularizationPayload {
  date?: string;
  reason: string;
  requestedPunchIn?: string;
  requestedPunchOut?: string;
}

export interface RegularizationActionPayload {
  comment?: string;
}

export interface CancelRegularizationPayload {
  reason?: string;
}

export type RegularizationScope = "self" | "team";

export interface RegularizationListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: RegularizationStatus;
  scope?: RegularizationScope;
  search?: string;
}
