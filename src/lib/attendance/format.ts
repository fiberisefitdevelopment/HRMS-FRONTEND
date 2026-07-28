import type { AttendanceStatus } from "@/types/attendance";

export const APP_TIMEZONE = "Asia/Kolkata";

/** True for API IST wall-clock strings like "2026-07-23T11:21:12" (no Z / offset). */
function isNaiveDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value.trim());
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Format a punch/datetime for display in IST.
 * Prefer backend `*Display` fields; never shift naive IST strings via Date+UTC.
 */
export function formatIstTime(
  value?: string | null,
  display?: string | null
): string {
  if (display?.trim()) return display.trim();
  if (!value) return "—";
  const raw = value.trim();

  if (isNaiveDateTime(raw)) {
    const [, time = ""] = raw.split("T");
    const [hStr = "0", mStr = "0"] = time.split(":");
    const hours = Number(hStr);
    const minutes = Number(mStr);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "—";
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  try {
    return new Date(raw).toLocaleTimeString("en-IN", {
      timeZone: APP_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

/** Format a calendar date (YYYY-MM-DD or datetime) without UTC off-by-one. */
export function formatIstDate(value?: string | null): string {
  if (!value) return "—";
  const raw = value.trim();
  const key = isDateOnly(raw)
    ? raw
    : isNaiveDateTime(raw)
      ? raw.slice(0, 10)
      : null;

  if (key) {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      timeZone: APP_TIMEZONE,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatMinutes(minutes?: number | null): string {
  if (minutes == null || minutes < 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Prefer late when backend still reports present but lateByMinutes is set. */
export function resolveAttendanceDisplayStatus(input: {
  attendanceStatus?: string | null;
  status?: string | null;
  lateByMinutes?: number | null;
  isRegularized?: boolean | null;
}): AttendanceStatus | string {
  if (input.isRegularized) return "regularized";
  const status = (input.attendanceStatus ?? input.status ?? "").toLowerCase();
  if (status === "regularized") return "regularized";
  if (status === "late" || (input.lateByMinutes ?? 0) > 0) return "late";
  return status || "present";
}

export function formatPunchTime(
  punch?: { timestamp?: string; timestampDisplay?: string | null } | string | null
): string {
  if (!punch) return "—";
  if (typeof punch === "string") return formatIstTime(punch);
  return formatIstTime(punch.timestamp, punch.timestampDisplay);
}

export function formatAttendanceDate(date?: string | null): string {
  return formatIstDate(date);
}

export function getEmployeeDisplayName(record: {
  user?: { fullName?: string; firstName?: string; lastName?: string };
  userId?: { fullName?: string; firstName?: string; lastName?: string } | string;
  employee?: { employeeId?: string };
  employeeProfileId?: { employeeId?: string } | string;
}): string {
  const user =
    record.user ??
    (record.userId && typeof record.userId === "object" ? record.userId : undefined);
  if (user?.fullName) return user.fullName;
  if (user?.firstName) return `${user.firstName} ${user.lastName ?? ""}`.trim();

  const employee =
    record.employee ??
    (record.employeeProfileId && typeof record.employeeProfileId === "object"
      ? record.employeeProfileId
      : undefined);
  return employee?.employeeId ?? "—";
}

/** API may return employeeProfileId as a populated object — always resolve to a string id for routes. */
export function resolveEmployeeProfileId(record: {
  employeeProfileId?: string | { _id?: string; id?: string };
  employee?: { _id?: string; id?: string };
}): string | undefined {
  const fromEmployee = record.employee?._id ?? record.employee?.id;
  if (fromEmployee) return String(fromEmployee);

  const profileId = record.employeeProfileId;
  if (!profileId) return undefined;
  if (typeof profileId === "string") return profileId;
  const id = profileId._id ?? profileId.id;
  return id ? String(id) : undefined;
}
