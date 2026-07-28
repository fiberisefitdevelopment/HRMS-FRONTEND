import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthTokens,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "@/types/auth";
import type { ApiUser } from "@/lib/auth/auth-mapper";

export interface LoginResponse {
  user: ApiUser;
  tokens: AuthTokens;
}

export interface MeResponse {
  user: ApiUser;
  permissions: string[];
}

export interface SwitchCompanyResponse {
  user: ApiUser;
  tokens: AuthTokens;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/refresh", {
      refreshToken,
    });
    return data.data;
  },

  async getMe(): Promise<MeResponse> {
    const { data } = await apiClient.get<ApiResponse<MeResponse>>("/auth/me");
    return data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post("/auth/change-password", payload);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string; expiresInMinutes?: number }> {
    const { data } = await apiClient.post<ApiResponse<{ message: string; expiresInMinutes?: number }>>(
      "/auth/forgot-password",
      { email: payload.email.toLowerCase().trim() }
    );
    return data.data;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<{ valid: boolean; message: string; email: string }> {
    const { data } = await apiClient.post<ApiResponse<{ valid: boolean; message: string; email: string }>>(
      "/auth/verify-otp",
      { email: payload.email.toLowerCase().trim(), otp: payload.otp.trim() }
    );
    return data.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", {
      email: payload.email.toLowerCase().trim(),
      otp: payload.otp.trim(),
      newPassword: payload.newPassword,
    });
    return data.data;
  },

  async switchCompany(companyId: string): Promise<SwitchCompanyResponse> {
    const { data } = await apiClient.post<ApiResponse<SwitchCompanyResponse>>(
      "/auth/switch-company",
      { companyId }
    );
    return data.data;
  },
};
