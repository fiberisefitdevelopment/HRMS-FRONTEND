import { apiClient } from "@/services/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { AuditLogEntry, AuditLogListParams } from "@/types/audit";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

type PopulatedUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
};

type ApiAuditLog = Omit<AuditLogEntry, "id" | "actor" | "subject"> & {
  _id?: string;
  id?: string;
  actor?: PopulatedUser | null;
  subject?: PopulatedUser | null;
};

function normalizeUser(u?: PopulatedUser | null) {
  if (!u) return null;
  return {
    id: u.id ?? u._id,
    fullName: u.fullName,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
  };
}

function normalizeAuditLog(doc: ApiAuditLog): AuditLogEntry {
  return {
    id: doc.id ?? doc._id ?? "",
    companyId: doc.companyId,
    userId: doc.userId,
    subjectUserId: doc.subjectUserId,
    actor: normalizeUser(doc.actor),
    subject: normalizeUser(doc.subject),
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId ?? null,
    changes: doc.changes ?? null,
    metadata: doc.metadata ?? {},
    ipAddress: doc.ipAddress ?? null,
    createdAt: doc.createdAt,
  };
}

export const auditService = {
  async list(params?: AuditLogListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiAuditLog>>("/audit-logs", {
      params: toListParams(params),
    });
    return {
      data: (data.data ?? []).map(normalizeAuditLog),
      meta: normalizeMeta(data.meta ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 }),
    };
  },
};
