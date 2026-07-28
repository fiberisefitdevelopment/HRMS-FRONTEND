export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  profile: "/profile",
  settings: "/settings",
  owner: "/owner",
  hr: "/hr",
  manager: "/manager",
  employee: "/employee",
  unauthorized: "/unauthorized",
  forbidden: "/forbidden",
  offline: "/offline",
  companies: "/companies",
  employees: "/employees",
  employeeNew: "/employees/new",
  employeeImport: "/employees/import",
  departments: "/employees/departments",
  designations: "/employees/designations",
  attendance: "/attendance",
  attendanceReports: "/attendance/reports",
  attendanceShifts: "/attendance/shifts",
  attendanceRegularization: "/attendance/regularization",
  attendanceWfh: "/attendance/wfh",
  organizationGeofencing: "/organization/geofencing",
  leave: "/leave",
  leaveAdd: "/leave/add",
  leaveCompOff: "/leave/comp-off",
  leaveReports: "/leave/reports",
  teams: "/teams",
  teamLeave: "/teams/leave",
  teamLive: "/teams/live",
  approvals: "/approvals",
  organization: "/organization",
  notifications: "/notifications",
  auditLogs: "/audit-logs",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export const PUBLIC_ROUTES: RoutePath[] = [
  ROUTES.unauthorized,
  ROUTES.forbidden,
  ROUTES.offline,
];

export const GUEST_ROUTES: RoutePath[] = [ROUTES.login, ROUTES.forgotPassword];

export const PROTECTED_ROUTES: RoutePath[] = [
  ROUTES.profile,
  ROUTES.settings,
  ROUTES.owner,
  ROUTES.hr,
  ROUTES.manager,
  ROUTES.employee,
];

export const ROLE_ROUTES: Record<string, RoutePath> = {
  owner: ROUTES.owner,
  hr: ROUTES.hr,
  manager: ROUTES.manager,
  employee: ROUTES.employee,
};
