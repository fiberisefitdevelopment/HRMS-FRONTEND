export type UserRole = "owner" | "hr" | "manager" | "employee";

export interface UserCompany {
  id: string;
  name: string;
  logo?: string;
  code?: string;
  status?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  role: UserRole;
  roleName?: string;
  permissions: string[];
  company?: UserCompany;
  department?: string;
  designation?: string;
  departmentId?: string;
  designationId?: string;
  accessibleCompanyIds?: string[];
  isActive: boolean;
  isBlocked?: boolean;
  status?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  /** Email address or employee code (e.g. FR0001) */
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthSession {
  user: User;
  permissions: string[];
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  permissions: string[];
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}
