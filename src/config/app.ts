export const APP_CONFIG = {
  name: "HRMS",
  description: "Enterprise Human Resource Management System",
  version: "1.0.0",
} as const;

export const API_CONFIG = {
  // Relative /api/v1 uses Next.js rewrites so LAN devices don't hit their own localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const STORAGE_KEYS = {
  accessToken: "hrms_access_token",
  refreshToken: "hrms_refresh_token",
  theme: "hrms_theme",
  sidebarCollapsed: "hrms_sidebar_collapsed",
  pinnedItems: "hrms_pinned_items",
  favoriteMenus: "hrms_favorite_menus",
  activeCompany: "hrms_active_company",
} as const;

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const;
