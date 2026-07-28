export const QUERY_KEYS = {
  auth: {
    session: ["auth", "session"] as const,
    me: ["auth", "me"] as const,
  },
  company: {
    all: (params?: unknown) => ["companies", params] as const,
    detail: (id: string) => ["companies", id] as const,
  },
  department: {
    all: (params?: unknown) => ["departments", params] as const,
    detail: (id: string) => ["departments", id] as const,
    lookup: ["departments", "lookup"] as const,
  },
  designation: {
    all: (params?: unknown) => ["designations", params] as const,
    detail: (id: string) => ["designations", id] as const,
    lookup: ["designations", "lookup"] as const,
  },
  employee: {
    all: (params?: unknown) => ["employees", params] as const,
    detail: (id: string) => ["employees", id] as const,
    me: ["employees", "me"] as const,
    managers: ["employees", "manager-options"] as const,
  },
  manager: {
    team: (params?: unknown) => ["managers", "team", params] as const,
  },
  attendance: {
    all: (params?: unknown) => ["attendance", "list", params] as const,
    today: ["attendance", "today"] as const,
    byEmployee: (id: string, params?: unknown) => ["attendance", "employee", id, params] as const,
    dashboardEmployee: ["attendance", "dashboard", "employee"] as const,
    dashboardHr: ["attendance", "dashboard", "hr"] as const,
    dashboardManager: ["attendance", "dashboard", "manager"] as const,
    monthlySummary: (year: number, month: number, params?: unknown) =>
      ["attendance", "monthly-summary", year, month, params] as const,
    report: (type: string, params?: unknown) => ["attendance", "report", type, params] as const,
    musterRoll: (params?: unknown) => ["attendance", "muster-roll", params] as const,
    managerLive: ["attendance", "dashboard", "manager", "live"] as const,
    policy: ["attendance", "policy"] as const,
  },
  geofence: {
    all: (params?: unknown) => ["geofences", params] as const,
    detail: (id: string) => ["geofences", id] as const,
    validate: (coords?: unknown) => ["geofences", "validate", coords] as const,
  },
  shift: {
    all: (params?: unknown) => ["shifts", params] as const,
    detail: (id: string) => ["shifts", id] as const,
  },
  leave: {
    all: (params?: unknown) => ["leave", "list", params] as const,
    detail: (id: string) => ["leave", "detail", id] as const,
    byEmployee: (id: string, params?: unknown) => ["leave", "employee", id, params] as const,
    balances: (userId?: string) => ["leave", "balances", userId] as const,
    ledger: (params?: unknown) => ["leave", "ledger", params] as const,
    calendar: (year: number, month: number, scope?: string) =>
      ["leave", "calendar", year, month, scope] as const,
    monthlySummary: (year: number, month: number) =>
      ["leave", "monthly-summary", year, month] as const,
    report: (type: string, params?: unknown) => ["leave", "report", type, params] as const,
  },
  leavePolicy: {
    current: ["leave-policy"] as const,
  },
  holidays: {
    all: (params?: unknown) => ["holidays", params] as const,
  },
  compOff: {
    all: (params?: unknown) => ["comp-off", "list", params] as const,
    detail: (id: string) => ["comp-off", "detail", id] as const,
    eligibility: (date?: string) => ["comp-off", "eligibility", date] as const,
  },
  regularization: {
    all: (params?: unknown) => ["regularization", "list", params] as const,
    detail: (id: string) => ["regularization", "detail", id] as const,
    eligibility: (date?: string) => ["regularization", "eligibility", date] as const,
  },
  workflow: {
    dashboard: ["workflow", "dashboard"] as const,
    pending: ["workflow", "pending"] as const,
    instances: (params?: unknown) => ["workflow", "instances", params] as const,
    detail: (id: string) => ["workflow", "instance", id] as const,
    history: (id: string) => ["workflow", "history", id] as const,
    byEmployee: (id: string, params?: unknown) => ["workflow", "employee", id, params] as const,
  },
  roles: { all: ["roles"] as const },
  permissions: { all: ["permissions"] as const },
  notifications: {
    all: (params?: unknown) => ["notifications", params] as const,
    unread: ["notifications", "unread"] as const,
  },
  audit: {
    all: (params?: unknown) => ["audit-logs", params] as const,
  },
  wfh: {
    all: (params?: unknown) => ["wfh", "list", params] as const,
    detail: (id: string) => ["wfh", "detail", id] as const,
  },
} as const;
