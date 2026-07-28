export type WorkflowStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "sent_back"
  | "escalated"
  | "delegated"
  | "completed";

export interface WorkflowLevelState {
  levelOrder: number;
  levelId?: string;
  levelName?: string;
  approverType?: string;
  approverIds?: string[];
  status: string;
  dueAt?: string;
  actedAt?: string;
  actedBy?: string;
}

export interface WorkflowInstance {
  id: string;
  companyId?: string;
  templateId?: string;
  workflowType: string;
  entityType?: string;
  entityId?: string;
  requesterId?: string;
  employeeProfileId?: string;
  departmentId?: string;
  currentLevelOrder?: number;
  currentApproverIds?: string[];
  status: WorkflowStatus | string;
  contextData?: Record<string, unknown>;
  levelStates?: WorkflowLevelState[];
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowAction {
  id?: string;
  instanceId?: string;
  levelOrder?: number;
  levelId?: string;
  actorId?: string;
  actor?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  action?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface WorkflowDashboard {
  pendingApprovals: WorkflowInstance[];
  myRequests: WorkflowInstance[];
  stats: {
    pendingApprovals: number;
    myPendingRequests: number;
    myApprovedRequests: number;
    escalated: number;
  };
}

export interface WorkflowListParams {
  page?: number;
  limit?: number;
  sort?: string;
  workflowType?: string;
  status?: string;
  entityType?: string;
  requesterId?: string;
  approverId?: string;
  startDate?: string;
  endDate?: string;
  mine?: boolean;
}

export interface WorkflowActionPayload {
  comment?: string;
}

export interface WorkflowDelegatePayload {
  delegateId: string;
  comment?: string;
}
