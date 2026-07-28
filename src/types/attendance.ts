export type AttendanceStatus =
  | "present"
  | "late"
  | "regularized"
  | "half_day"
  | "absent"
  | "holiday"
  | "week_off"
  | "leave"
  | "missing_punch"
  | "auto_punch_out"
  | "on_leave";

export type AttendanceSource = "web" | "mobile" | "manual" | "api" | "biometric" | "qr";

export type BreakType = "lunch" | "tea_break_1" | "tea_break_2";

export type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "department"
  | "employee"
  | "shift"
  | "late"
  | "regularization";

export interface PunchMeta {
  timestamp: string;
  timestampDisplay?: string | null;
  source?: AttendanceSource;
  device?: string;
  browser?: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface PunchSession {
  punchIn?: PunchMeta | null;
  punchOut?: PunchMeta | null;
}

export interface AttendanceRecord {
  id: string;
  employeeProfileId: string;
  userId: string;
  shiftId?: string | null;
  date: string;
  punchIn?: PunchMeta | null;
  punchOut?: PunchMeta | null;
  /** Multiple in/out cycles; punchIn/punchOut are first-in / last-out summaries */
  punchSessions?: PunchSession[];
  lunchStart?: string | null;
  lunchEnd?: string | null;
  teaBreak1Start?: string | null;
  teaBreak1End?: string | null;
  teaBreak2Start?: string | null;
  teaBreak2End?: string | null;
  grossWorkingMinutes?: number;
  breakDurationMinutes?: number;
  netWorkingMinutes?: number;
  lateByMinutes?: number;
  earlyExitMinutes?: number;
  isRegularized?: boolean;
  attendanceStatus: AttendanceStatus;
  attendanceSource?: AttendanceSource;
  isAutoPunchOut?: boolean;
  remarks?: string | null;
  status?: string;
  employee?: {
    id?: string;
    employeeId?: string;
    userId?: string;
    departmentId?: string | { name?: string };
  };
  user?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  };
  shift?: {
    id?: string;
    name?: string;
    code?: string;
    startTime?: string;
    endTime?: string;
  };
}

export interface WorkingTimer {
  grossWorkingMinutes: number;
  breakDurationMinutes: number;
  netWorkingMinutes: number;
  earlyExitMinutes?: number;
}

export interface AttendanceToday {
  date: string;
  attendanceStatus: AttendanceStatus;
  /** Currently in an open punch session (can punch out) */
  punchedIn: boolean;
  /** Has completed session(s) and no open session (can punch in again) */
  punchedOut: boolean;
  workingTimer?: WorkingTimer;
  id?: string;
  punchIn?: PunchMeta | null;
  punchOut?: PunchMeta | null;
  punchSessions?: PunchSession[];
  shift?: AttendanceRecord["shift"];
  grossWorkingMinutes?: number;
  breakDurationMinutes?: number;
  netWorkingMinutes?: number;
  lateByMinutes?: number;
  isRegularized?: boolean;
  attendanceSource?: AttendanceSource;
  isAutoPunchOut?: boolean;
}

export interface MonthlySummary {
  present: number;
  late: number;
  regularized: number;
  half_day: number;
  absent: number;
  total: number;
}

export interface AttendanceMonthlySummary {
  year: number;
  month: number;
  summary: MonthlySummary;
  totalNetMinutes: number;
  records: AttendanceRecord[];
}

export interface AttendanceDashboardEmployee {
  today: AttendanceToday;
  monthlySummary: MonthlySummary;
}

export interface AttendanceDashboardSummary {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  regularized?: number;
  missingPunch?: number;
  pendingPunchOut?: number;
  total: number;
}

export interface AttendanceDashboardHr {
  summary: AttendanceDashboardSummary;
  lateEmployees: AttendanceRecord[];
  missingPunch: AttendanceRecord[];
  records: AttendanceRecord[];
}

export interface AttendanceDashboardManager {
  summary: AttendanceDashboardSummary;
  records: AttendanceRecord[];
}

export interface AttendanceReportResult {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  totalRecords: number;
  statusSummary: Record<string, number>;
  data: AttendanceRecord[];
}

export type MusterCode =
  | "P"
  | "L"
  | "HD"
  | "A"
  | "LV"
  | "H"
  | "WO"
  | "MP"
  | "NJ"
  | "-";

export interface MusterRollDay {
  day: number;
  date: string;
  weekday: number;
  isWeekOff?: boolean;
  isHoliday: boolean;
  holidayName: string | null;
}

export interface MusterRollSummary {
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  leave: number;
  holiday: number;
  weekOff: number;
  missingPunch: number;
  payableDays: number;
}

export interface MusterRollDayDetail {
  date: string;
  code: MusterCode;
  attendanceId?: string | null;
  punchIn?: string | null;
  punchInDisplay?: string | null;
  punchOut?: string | null;
  punchOutDisplay?: string | null;
  remarks?: string | null;
  attendanceStatus?: string | null;
}

export interface MusterRollEmployee {
  employeeProfileId: string;
  employeeId: string;
  name: string;
  department: string | null;
  designation: string | null;
  shift?: string | null;
  workingDays?: number[];
  status: string;
  days: Record<string, MusterCode>;
  dayDetails?: Record<string, MusterRollDayDetail>;
  summary: MusterRollSummary;
}

export interface MusterRoll {
  year: number;
  month: number;
  daysInMonth: number;
  days: MusterRollDay[];
  legend: Record<string, string>;
  employees: MusterRollEmployee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MusterRollParams {
  year: number;
  month: number;
  departmentId?: string;
  status?: EmployeeStatusFilter;
  search?: string;
  page?: number;
  limit?: number;
}

export type EmployeeStatusFilter =
  | "active"
  | "inactive"
  | "terminated"
  | "on_leave"
  | "resigned";

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: AttendanceStatus;
  shiftId?: string;
  userId?: string;
  employeeProfileId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AttendanceReportParams {
  type?: ReportType;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  shiftId?: string;
  status?: AttendanceStatus;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CorrectAttendancePayload {
  punchIn?: { timestamp: string };
  punchOut?: { timestamp: string };
  attendanceStatus?: string;
  remarks?: string;
}

export interface CorrectAttendanceByDatePayload {
  employeeProfileId: string;
  date: string;
  attendanceStatus: string;
  remarks: string;
  punchIn?: { timestamp: string };
  punchOut?: { timestamp: string };
}

export interface PunchPayload {
  source?: AttendanceSource;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface LocationHeartbeatPayload {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface LastKnownLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  recordedAt: string;
  source: "punch" | "heartbeat";
}

export interface ManagerLiveGeofenceStatus {
  inside: boolean;
  distanceMeters: number | null;
  matchedOffice: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    distanceMeters: number | null;
  } | null;
  nearestOffice: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    distanceMeters: number | null;
  } | null;
}

export interface ManagerLiveTeamMember {
  employeeProfileId: string;
  employeeId: string;
  userId: string;
  name: string | null;
  email: string | null;
  department: string | null;
  attendanceStatus: string;
  punchedIn: boolean;
  hasOpenSession: boolean;
  punchIn: PunchMeta | null;
  punchOut: PunchMeta | null;
  lastKnownLocation: LastKnownLocation | null;
  geofenceStatus: ManagerLiveGeofenceStatus | null;
}

export interface ManagerLiveDashboard {
  asOf: string;
  summary: {
    total: number;
    punchedIn: number;
    withLocation: number;
    insideGeofence: number;
    outsideGeofence: number;
  };
  team: ManagerLiveTeamMember[];
}

export interface BreakPayload {
  breakType: BreakType;
}
