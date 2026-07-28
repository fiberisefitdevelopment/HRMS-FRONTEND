export type CompOffStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface CompOffEligibility {
  date: string;
  attendanceRecordId?: string;
  shiftEndTime?: string;
  shiftEndDisplay?: string;
  punchOutAt?: string;
  overtimeMinutes: number;
  eligibleDays: 0 | 0.5 | 1 | number;
  isEligible: boolean;
  hasExistingRequest: boolean;
  existingRequestId?: string | null;
  existingStatus?: CompOffStatus | string | null;
}

export interface CompOffRequest {
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
  managerId?: string;
  attendanceDate: string;
  attendanceRecordId?: string;
  shiftId?: string;
  shiftEndTime?: string;
  punchOutAt?: string;
  overtimeMinutes: number;
  requestedDays: number;
  reason: string;
  status: CompOffStatus | string;
  workflowInstanceId?: string;
  approvedAt?: string;
  rejectedReason?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RaiseCompOffPayload {
  date?: string;
  reason?: string;
}

export interface CancelCompOffPayload {
  reason?: string;
}

export type CompOffScope = "self" | "team";

export interface CompOffListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: CompOffStatus;
  scope?: CompOffScope;
  all?: boolean;
  search?: string;
}
