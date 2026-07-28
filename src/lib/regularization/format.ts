import type {
  RegularizationActor,
  RegularizationEligibility,
  RegularizationRequest,
} from "@/types/regularization";
import { formatAttendanceDate, formatMinutes, formatPunchTime } from "@/lib/attendance/format";

export function getRegularizationEmployeeName(request: RegularizationRequest): string {
  const fromUser =
    request.user?.fullName ??
    [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ");
  return fromUser || request.employee?.employeeId || "—";
}

export function getRegularizationRequestDate(request?: {
  date?: string | null;
  attendanceDate?: string | null;
  punchInAt?: string | null;
  requestedPunchIn?: string | null;
  createdAt?: string | null;
} | null): string | undefined {
  if (!request) return undefined;
  const candidates = [
    request.date,
    request.attendanceDate,
    request.punchInAt,
    request.requestedPunchIn,
    request.createdAt,
  ];
  for (const value of candidates) {
    if (!value) continue;
    const sliced = String(value).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) return sliced;
  }
  return undefined;
}

export function formatRegularizationDate(date?: string | null) {
  return formatAttendanceDate(date);
}

export function formatRequestDate(request?: RegularizationRequest | null) {
  return formatRegularizationDate(getRegularizationRequestDate(request));
}

export function formatLateBy(minutes?: number | null) {
  return formatMinutes(minutes);
}

/** Prefer backend punchInDisplay (IST); fall back to formatting punchInAt. */
export function formatRegularizationPunchTime(
  punchInAt?: string | null,
  punchInDisplay?: string | null
): string {
  if (punchInDisplay?.trim()) return punchInDisplay.trim();
  if (punchInAt) {
    const formatted = formatPunchTime(punchInAt);
    if (formatted !== "—") return formatted;
  }
  return "—";
}

export function formatAppliedStatus(status?: string | null) {
  if (!status) return undefined;
  return status.replaceAll("_", " ");
}

export function getActorDisplayName(
  actor?: RegularizationActor | string | null,
  fallbackName?: string | null
): string {
  if (fallbackName) return fallbackName;
  if (!actor) return "—";
  if (typeof actor === "string") return actor;
  if (actor.fullName) return actor.fullName;
  const name = [actor.firstName, actor.lastName].filter(Boolean).join(" ");
  return name || actor.email || "—";
}

export function getApproverDisplayName(request: RegularizationRequest): string {
  if (request.status === "rejected") {
    return getActorDisplayName(request.rejectedBy, request.rejectedByName);
  }
  if (request.status === "approved") {
    return getActorDisplayName(request.approvedBy, request.approvedByName);
  }
  return "—";
}

/** Combine YYYY-MM-DD + HH:mm (local) into an ISO string for the API. */
export function combineDateAndTimeToIso(date: string, time?: string): string | undefined {
  if (!date || !time) return undefined;
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;
  const local = new Date(`${date}T00:00:00`);
  if (Number.isNaN(local.getTime())) return undefined;
  local.setHours(hours, minutes, 0, 0);
  return local.toISOString();
}

export function formatStatusLabel(status?: string | null) {
  if (!status) return "—";
  return status.replaceAll("_", " ");
}

/**
 * Trust backend eligibility fields. Only fill missing punchInDisplay for UI.
 */
export function normalizeRegularizationEligibility(
  data: RegularizationEligibility
): RegularizationEligibility {
  const punchInDisplay =
    data.punchInDisplay?.trim() ||
    (data.punchInAt ? formatPunchTime(data.punchInAt) : null);

  return {
    ...data,
    punchInDisplay,
  };
}
