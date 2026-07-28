export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type HalfDaySession = "morning" | "afternoon";

export type LeaveReportType =
  | "balance"
  | "summary"
  | "company"
  | "department"
  | "monthly"
  | "quarterly"
  | "short_leave";

export interface LeaveApproverRef {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface LeaveApproval {
  stage?: string;
  approverId?: string;
  approver?: LeaveApproverRef | null;
  status?: string;
  comment?: string | null;
  actedAt?: string | null;
}

export interface LeaveActionPayload {
  comment?: string;
}

export interface LeaveRequest {
  id: string;
  companyId?: string;
  employeeProfileId?: string;
  userId?: string;
  departmentId?: string;
  managerId?: string;
  leaveType: string;
  leaveTypeCode?: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason?: string;
  attachments?: string[];
  /** Medical leave prescription file URL */
  prescription?: string | null;
  appliedOn?: string;
  status: LeaveStatus | string;
  currentApprovalStage?: string;
  approvals?: LeaveApproval[];
  approvedBy?: LeaveApproverRef | null;
  rejectedBy?: LeaveApproverRef | null;
  rejectedReason?: string | null;
  cancelledAt?: string;
  cancelledReason?: string;
  approvedAt?: string;
  /** Legacy only — new leave requests no longer create workflow instances */
  workflowInstanceId?: string;
  source?: "self" | "manual_hr" | "manual_manager";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  employee?: {
    employeeId?: string;
    user?: { fullName?: string; firstName?: string; lastName?: string };
  };
  user?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface LeaveBalance {
  leaveType: string;
  leaveTypeCode: string;
  /** Friendly display name from leave policy when available */
  name?: string;
  balance: number;
  lastCreditedAt?: string | null;
  lastDebitedAt?: string | null;
}

export interface LeaveLedgerEntry {
  id: string;
  leaveType: string;
  leaveTypeCode: string;
  transactionType: "opening_balance" | "credit" | "debit" | "adjustment";
  openingBalance: number;
  credit: number;
  debit: number;
  adjustment: number;
  closingBalance: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  transactionDate?: string;
}

export interface LeaveCalendarEvent {
  id: string;
  title?: string;
  leaveType: string;
  leaveTypeCode: string;
  employeeProfileId?: string;
  userId?: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  status: string;
}

export interface LeaveCalendar {
  year: number;
  month: number;
  events: LeaveCalendarEvent[];
}

export interface LeaveMonthlySummaryItem {
  approved: number;
  pending: number;
  rejected: number;
  totalDays: number;
}

export interface LeaveMonthlySummary {
  year: number;
  month: number;
  summary: Record<string, LeaveMonthlySummaryItem>;
  totalRequests: number;
}

export type LeaveScope = "self" | "team" | "company";

export interface LeaveListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: LeaveStatus;
  leaveTypeCode?: string;
  departmentId?: string;
  employeeProfileId?: string;
  startDate?: string;
  endDate?: string;
  all?: boolean;
  search?: string;
  scope?: LeaveScope;
}

export interface LeaveReportParams {
  year?: number;
  month?: number;
  quarter?: number;
  departmentId?: string;
  leaveTypeCode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  format?: "xlsx" | "csv";
}

export interface LeaveReportRow {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  departmentId?: string;
  leaveType?: string;
  leaveTypeCode?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  status?: string;
  appliedOn?: string;
  balance?: number;
}

export interface LeaveReportResult {
  type: string;
  data: LeaveReportRow[];
  period?: { startDate?: string; endDate?: string };
}

export interface ApplyLeavePayload {
  leaveType: string;
  leaveTypeCode?: string;
  /** Optional — both dates or neither (balance-only leave when omitted) */
  startDate?: string;
  endDate?: string;
  /** Required when dates are omitted (min 0.5); optional when dates provided */
  totalDays?: number;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
  attachments?: string[];
  /** Medical leave prescription file (multipart field `prescription`) */
  prescriptionFile?: File;
  /** HR/Owner only — employee to credit leave for */
  employeeProfileId?: string;
  userId?: string;
}

export interface BulkApplyLeavePayload {
  employeeProfileIds: string[];
  leaveType: string;
  leaveTypeCode?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
  attachments?: string[];
}

export interface BulkApplyLeaveError {
  employeeProfileId: string;
  message: string;
}

export interface BulkApplyLeaveResult {
  success: number;
  failed: number;
  leaves: LeaveRequest[];
  errors: BulkApplyLeaveError[];
}

/** HR credits leave days onto an employee's balance (does not create a leave request). */
export interface CreditLeaveBalancePayload {
  employeeProfileId: string;
  leaveType: string;
  leaveTypeCode?: string;
  totalDays: number;
  reason: string;
}

export interface BulkCreditLeaveBalancePayload {
  employeeProfileIds: string[];
  leaveType: string;
  leaveTypeCode?: string;
  totalDays: number;
  reason: string;
}

export interface CreditLeaveBalanceResult {
  employeeProfileId: string;
  leaveType: string;
  leaveTypeCode: string;
  credited: number;
  previousBalance: number;
  balance: number;
  ledgerEntryId?: string;
}

export interface BulkCreditLeaveBalanceResult {
  success: number;
  failed: number;
  credits: CreditLeaveBalanceResult[];
  errors: BulkApplyLeaveError[];
}

export interface CancelLeavePayload {
  reason?: string;
}
