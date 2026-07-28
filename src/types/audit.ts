export interface AuditActor {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuditLogEntry {
  id: string;
  companyId?: string;
  userId?: string;
  subjectUserId?: string;
  actor?: AuditActor | null;
  subject?: AuditActor | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: {
    before?: unknown;
    after?: unknown;
  } | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  sort?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
