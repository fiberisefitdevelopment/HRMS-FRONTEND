export type ShiftStatus = "active" | "inactive";

export interface BreakTiming {
  type: "lunch" | "tea_break_1" | "tea_break_2";
  start?: string;
  end?: string;
  durationMinutes?: number;
}

export interface Shift {
  id: string;
  companyId: string;
  policyId?: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingDays?: number[];
  breakTimings?: BreakTiming[];
  gracePeriodMinutes?: number;
  status: ShiftStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShiftPayload {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingDays?: number[];
  breakTimings?: BreakTiming[];
  gracePeriodMinutes?: number;
  policyId?: string;
}

export type UpdateShiftPayload = Partial<CreateShiftPayload>;

export interface ShiftListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: ShiftStatus;
}

export interface AssignShiftPayload {
  employeeProfileId: string;
  userId: string;
  shiftId: string;
}

export interface UnassignShiftPayload {
  employeeProfileId: string;
}

export interface ShiftAssignment {
  id: string;
  companyId: string;
  employeeProfileId: string;
  userId: string;
  shiftId: string;
  isActive: boolean;
  assignedBy?: string;
  createdAt?: string;
}
