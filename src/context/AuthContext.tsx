import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LoginInput, RegisterInput, User } from "../models/types";
import { AuthService } from "../services/authService";

// ============================================
// AUTH CONTEXT TYPES
// ============================================
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<{ success: boolean; message?: string }>;
  register: (
    data: RegisterInput
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER
// ============================================
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // ============================================
  // AUTHENTICATION CHECK ON MOUNT
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();

        if (isAuth) {
          const userData = await AuthService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ============================================
  // ROUTE PROTECTION
  // ============================================
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(public)";
    const inPrivateGroup = segments[0] === "(private)";

    if (!user && inPrivateGroup) {
      // User is not authenticated but trying to access private routes
      router.replace("/(public)/login");
    } else if (user && inAuthGroup) {
      // User is authenticated but on auth screens
      router.replace("/(private)");
    }
  }, [user, segments, isLoading]);

  // ============================================
  // AUTH METHODS
  // ============================================
  const login = useCallback(
    async (
      data: LoginInput
    ): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true);
      try {
        const result = await AuthService.login(data);

        if (result.success && result.user) {
          setUser(result.user);
          router.replace("/(private)");
          return { success: true };
        }

        return { success: false, message: result.message };
      } catch (error) {
        return { success: false, message: "Login failed. Please try again." };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (
      data: RegisterInput
    ): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true);
      try {
        const result = await AuthService.register(data);

        if (result.success) {
          // After registration, fetch user data
          const userData = await AuthService.getMe();
          setUser(userData);
          router.replace("/(private)");
          return { success: true };
        }

        return { success: false, message: result.message };
      } catch (error) {
        return {
          success: false,
          message: "Registration failed. Please try again.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      router.replace("/(public)/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await AuthService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// HOOK
// ============================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
