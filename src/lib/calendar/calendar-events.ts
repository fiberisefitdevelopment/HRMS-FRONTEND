import { eachLocalDayInRange, toLocalDateKey } from "@/lib/date/calendar";
import { isNonWorkingDay } from "@/lib/employee/working-days";
import { resolveAttendanceDisplayStatus } from "@/lib/attendance/format";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

export interface CalendarDayEvent {
  label: string;
  tone: string;
  /** Optional navigation target. */
  href?: string;
  /** Opens raise dialog for regularization or comp-off. */
  action?: "regularize" | "comp_off";
  actionDate?: string;
}

export type CalendarEventMap = Map<string, CalendarDayEvent[]>;

export interface CalendarDayPunch {
  punchIn?: string | null;
  punchOut?: string | null;
}

export type CalendarPunchMap = Map<string, CalendarDayPunch>;

function addRange(
  map: CalendarEventMap,
  start: string,
  end: string,
  label: string,
  tone: string
) {
  eachLocalDayInRange(start, end, (key) => {
    const existing = map.get(key) ?? [];
    existing.push({ label, tone });
    map.set(key, existing);
  });
}

const LEAVE_APPROVED_TONE = "bg-emerald-500/20 text-emerald-800";
const LEAVE_PENDING_TONE = "bg-amber-500/20 text-amber-800";
const LEAVE_REJECTED_TONE = "bg-red-500/20 text-red-800";
const HOLIDAY_TONE = "bg-blue-500/20 text-blue-800";
export const REGULARIZE_ELIGIBLE_TONE =
  "bg-amber-500/25 text-amber-900 dark:text-amber-200 hover:bg-amber-500/35 underline-offset-2 hover:underline";
export const COMP_OFF_ELIGIBLE_TONE =
  "bg-teal-500/25 text-teal-900 dark:text-teal-200 hover:bg-teal-500/35 underline-offset-2 hover:underline";
export const OFF_DAY_WORK_TONE = "bg-teal-500/15 text-teal-800 dark:text-teal-300";

const WORKED_STATUSES = new Set<AttendanceStatus>([
  "present",
  "late",
  "regularized",
  "half_day",
  "missing_punch",
  "auto_punch_out",
]);

const ATTENDANCE_TONES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/20 text-emerald-800",
  late: "bg-amber-500/20 text-amber-800",
  regularized: "bg-sky-500/20 text-sky-800",
  half_day: "bg-amber-500/20 text-amber-800",
  absent: "bg-red-500/20 text-red-800",
  holiday: HOLIDAY_TONE,
  week_off: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  leave: "bg-blue-500/20 text-blue-800",
  missing_punch: "bg-red-500/20 text-red-800",
  auto_punch_out: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  on_leave: "bg-blue-500/20 text-blue-800",
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  regularized: "Regularized",
  half_day: "Half Day",
  absent: "Absent",
  holiday: "Holiday",
  week_off: "Week Off",
  leave: "Leave",
  missing_punch: "Missing Punch",
  auto_punch_out: "Auto Punch Out",
  on_leave: "On Leave",
};

const LEAVE_OVERLAP_STATUSES: AttendanceStatus[] = ["leave", "on_leave", "holiday"];

interface LeaveCalendarInput {
  approvedEvents?: { startDate: string; endDate: string; leaveTypeCode: string }[];
  pendingLeaves?: { startDate: string; endDate: string; leaveTypeCode?: string; leaveType?: string }[];
  rejectedLeaves?: { startDate: string; endDate: string; leaveTypeCode?: string; leaveType?: string }[];
  holidays?: { date: string; name: string }[];
}

export function buildLeaveEventMap(input: LeaveCalendarInput): CalendarEventMap {
  const map: CalendarEventMap = new Map();

  input.approvedEvents?.forEach((e) =>
    addRange(map, e.startDate, e.endDate, `${e.leaveTypeCode} approved`, LEAVE_APPROVED_TONE)
  );
  input.pendingLeaves?.forEach((e) =>
    addRange(
      map,
      e.startDate,
      e.endDate,
      `${e.leaveTypeCode ?? e.leaveType} pending`,
      LEAVE_PENDING_TONE
    )
  );
  input.rejectedLeaves?.forEach((e) =>
    addRange(
      map,
      e.startDate,
      e.endDate,
      `${e.leaveTypeCode ?? e.leaveType} rejected`,
      LEAVE_REJECTED_TONE
    )
  );
  input.holidays?.forEach((h) => {
    const key = toLocalDateKey(h.date);
    const existing = map.get(key) ?? [];
    existing.push({ label: h.name, tone: HOLIDAY_TONE });
    map.set(key, existing);
  });

  return map;
}

export function buildAttendanceEventMap(
  records: AttendanceRecord[],
  options?: { workingDays?: number[] | null }
): CalendarEventMap {
  const map: CalendarEventMap = new Map();
  const workingDays = options?.workingDays;

  records.forEach((record) => {
    const key = toLocalDateKey(record.date);
    const status = resolveAttendanceDisplayStatus(record) as AttendanceStatus;
    const offDay = isNonWorkingDay(key, workingDays);

    let label = ATTENDANCE_LABELS[status] ?? status.replace(/_/g, " ");
    let tone = ATTENDANCE_TONES[status] ?? "bg-muted text-muted-foreground";

    // 5-day (or custom) weeks: weekend / off-day punches are OT, not late/absent.
    if (offDay) {
      if (WORKED_STATUSES.has(status) || (record.lateByMinutes ?? 0) > 0 || record.punchIn) {
        label = "Off-day work";
        tone = OFF_DAY_WORK_TONE;
      } else if (status === "absent") {
        label = ATTENDANCE_LABELS.week_off;
        tone = ATTENDANCE_TONES.week_off;
      }
    }

    const existing = map.get(key) ?? [];
    existing.push({ label, tone });
    map.set(key, existing);
  });

  return map;
}

/** First punch-in and last punch-out per calendar day (from monthly attendance records). */
export function buildAttendancePunchMap(records: AttendanceRecord[]): CalendarPunchMap {
  const map: CalendarPunchMap = new Map();
  records.forEach((record) => {
    const key = toLocalDateKey(record.date);
    map.set(key, {
      punchIn: record.punchIn?.timestamp ?? null,
      punchOut: record.punchOut?.timestamp ?? null,
    });
  });
  return map;
}

/** Merge leave + attendance events; leave/holiday labels win over duplicate attendance leave markers. */
export function mergeCalendarEventMaps(
  leaveMap: CalendarEventMap,
  attendanceMap: CalendarEventMap
): CalendarEventMap {
  const merged: CalendarEventMap = new Map(leaveMap);

  attendanceMap.forEach((attEvents, key) => {
    const leaveEvents = merged.get(key) ?? [];
    const hasLeaveLayer = leaveEvents.length > 0;

    const attendanceToAdd = attEvents.filter((event) => {
      if (!hasLeaveLayer) return true;
      return !LEAVE_OVERLAP_STATUSES.some((status) => event.label === ATTENDANCE_LABELS[status]);
    });

    if (attendanceToAdd.length === 0) return;

    merged.set(key, [...leaveEvents, ...attendanceToAdd]);
  });

  return merged;
}

/** Merge extra events into a base map. Prefer prepending so compact calendars show action chips first. */
export function appendCalendarEvents(
  base: CalendarEventMap,
  extra: CalendarEventMap,
  options?: { prepend?: boolean }
): CalendarEventMap {
  if (extra.size === 0) return base;
  const merged: CalendarEventMap = new Map(base);
  const prepend = options?.prepend ?? false;
  extra.forEach((events, key) => {
    const existing = merged.get(key) ?? [];
    merged.set(key, prepend ? [...events, ...existing] : [...existing, ...events]);
  });
  return merged;
}

export function buildRegularizationEligibleEventMap(dates: string[]): CalendarEventMap {
  const map: CalendarEventMap = new Map();
  dates.forEach((date) => {
    const key = toLocalDateKey(date);
    const existing = map.get(key) ?? [];
    existing.push({
      label: "Regularize",
      tone: REGULARIZE_ELIGIBLE_TONE,
      action: "regularize",
      actionDate: key,
    });
    map.set(key, existing);
  });
  return map;
}

export function buildCompOffEligibleEventMap(dates: string[]): CalendarEventMap {
  const map: CalendarEventMap = new Map();
  dates.forEach((date) => {
    const key = toLocalDateKey(date);
    const existing = map.get(key) ?? [];
    existing.push({
      label: "Comp-off",
      tone: COMP_OFF_ELIGIBLE_TONE,
      action: "comp_off",
      actionDate: key,
    });
    map.set(key, existing);
  });
  return map;
}
