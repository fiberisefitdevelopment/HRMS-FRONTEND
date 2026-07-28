export type CreditCycle = "monthly" | "quarterly" | "half_yearly" | "yearly";

export type ApprovalStage = "manager" | "hr" | "owner";

export interface LeaveTypeConfig {
  code: string;
  name: string;
  leaveType: string;
  creditAmount?: number;
  creditCycle?: CreditCycle;
  maxBalance?: number;
  carryForward?: boolean;
  carryForwardLimit?: number;
  requiresAttachment?: boolean;
  allowNegativeBalance?: boolean;
  expiryMonths?: number;
  isActive?: boolean;
  approvalFlow?: ApprovalStage[];
}

export interface ShortLeaveConfig {
  monthlyAllowance?: number;
  autoDeduct?: boolean;
  resetMonthly?: boolean;
}

export interface ApprovalWorkflowConfig {
  stages?: ApprovalStage[];
  hrFinalApproval?: boolean;
}

export interface WorkingDaysConfig {
  excludeWeekends?: boolean;
  workingDays?: number[];
}

export interface PolicyHoliday {
  date: string;
  name: string;
}

export interface LeavePolicy {
  id?: string;
  companyId?: string;
  name: string;
  isDefault?: boolean;
  status?: string;
  leaveTypes: LeaveTypeConfig[];
  shortLeave?: ShortLeaveConfig;
  approvalWorkflow?: ApprovalWorkflowConfig;
  workingDaysForLeave?: WorkingDaysConfig;
  holidays?: PolicyHoliday[];
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateLeavePolicyPayload = Partial<
  Omit<LeavePolicy, "id" | "companyId" | "createdAt" | "updatedAt">
>;
