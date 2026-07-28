import type { AttendanceRecord, AttendanceToday, PunchSession } from "@/types/attendance";

type PunchRecordLike = Pick<AttendanceRecord, "punchSessions" | "punchIn" | "punchOut"> | null | undefined;

/** Derive session list from API payload (supports legacy single punch fields). */
export function getPunchSessions(
  today?: Pick<AttendanceToday, "punchSessions" | "punchIn" | "punchOut"> | null
): PunchSession[] {
  return getPunchSessionsFromRecord(today);
}

export function getPunchSessionsFromRecord(record?: PunchRecordLike): PunchSession[] {
  if (!record) return [];
  if (Array.isArray(record.punchSessions) && record.punchSessions.length > 0) {
    return record.punchSessions;
  }
  if (record.punchIn?.timestamp) {
    return [{ punchIn: record.punchIn, punchOut: record.punchOut ?? null }];
  }
  return [];
}

/** True when the employee has an open punch-in session (not yet punched out). */
export function hasOpenPunchSession(today?: AttendanceToday | null): boolean {
  if (!today) return false;
  if (typeof today.punchedIn === "boolean") {
    return today.punchedIn;
  }
  const sessions = getPunchSessions(today);
  if (sessions.length === 0) return false;
  const last = sessions[sessions.length - 1];
  return Boolean(last.punchIn?.timestamp) && !last.punchOut?.timestamp;
}

export function getFirstPunchIn(today?: AttendanceToday | null) {
  return getFirstPunchInFromRecord(today);
}

export function getFirstPunchInFromRecord(record?: PunchRecordLike) {
  const sessions = getPunchSessionsFromRecord(record);
  return sessions.find((s) => s.punchIn?.timestamp)?.punchIn ?? record?.punchIn ?? null;
}

export function getLastPunchOut(today?: AttendanceToday | null) {
  return getLastPunchOutFromRecord(today);
}

export function getLastPunchOutFromRecord(record?: PunchRecordLike) {
  const sessions = getPunchSessionsFromRecord(record);
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    if (sessions[i].punchOut?.timestamp) return sessions[i].punchOut;
  }
  return record?.punchOut ?? null;
}

export function getSessionDurationMinutes(session: PunchSession): number | null {
  if (!session.punchIn?.timestamp) return null;
  const end = session.punchOut?.timestamp ? new Date(session.punchOut.timestamp) : new Date();
  const start = new Date(session.punchIn.timestamp);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

export function isSessionActive(session: PunchSession): boolean {
  return Boolean(session.punchIn?.timestamp) && !session.punchOut?.timestamp;
}
