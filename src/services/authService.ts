import { AxiosError } from "axios";
import {
  ApiError,
  AuthResponse,
  DeviceInfo,
  LoginInput,
  RegisterInput,
  User,
} from "../models/types";
import api, { TokenManager } from "./api";

// ============================================
// AUTH SERVICE
// ============================================
export const AuthService = {
  /**
   * Register a new user
   */
  register: async (
    data: RegisterInput
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        await TokenManager.setTokens(accessToken, refreshToken);
      }

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Registration failed";
      return { success: false, message };
    }
  },

  /**
   * Login user
   */
  login: async (
    data: LoginInput,
    deviceInfo?: DeviceInfo
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        ...data,
        deviceInfo: deviceInfo || { userAgent: "QureClinics-Mobile-App" },
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        await TokenManager.setTokens(accessToken, refreshToken);
        return { success: true, user };
      }

      return { success: false, message: "Login failed" };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Invalid credentials";
      return { success: false, message };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      // Silent fail - we still want to clear local tokens
      console.warn("Logout API call failed:", error);
    } finally {
      await TokenManager.clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User | null> => {
    try {
      const response = await api.get<{ success: boolean; data: User }>(
        "/auth/me"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    return TokenManager.hasTokens();
  },

  /**
   * Refresh the access token
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await api.post<AuthResponse>("/auth/refresh-token", {
        refreshToken,
        deviceInfo: { userAgent: "QureClinics-Mobile-App" },
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;
        await TokenManager.setTokens(accessToken, newRefreshToken);
        return true;
      }

      return false;
    } catch (error) {
      await TokenManager.clearTokens();
      return false;
    }
  },
};

export default AuthService;

