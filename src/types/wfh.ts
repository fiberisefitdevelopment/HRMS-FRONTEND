export type WfhStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface WfhActor {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface WfhRequest {
  id: string;
  companyId?: string;
  employeeProfileId?: string;
  userId?: string;
  user?: WfhActor | null;
  employee?: {
    id?: string;
    employeeId?: string;
  } | null;
  managerId?: string;
  manager?: WfhActor | null;
  date: string;
  attendanceRecordId?: string | null;
  reason?: string;
  status: WfhStatus | string;
  approvedBy?: WfhActor | null;
  approvedAt?: string | null;
  approvedComment?: string | null;
  rejectedBy?: WfhActor | null;
  rejectedReason?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyWfhPayload {
  date: string;
  reason?: string;
}

export interface WfhActionPayload {
  comment?: string;
}

export type WfhScope = "self" | "team";

export interface WfhListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: WfhStatus;
  scope?: WfhScope;
  all?: boolean;
  employeeProfileId?: string;
}
