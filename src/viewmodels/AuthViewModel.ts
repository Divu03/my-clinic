import { useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LoginInput,
  loginSchema,
  RegisterInput,
  registerSchema,
} from "../models/types";

// ============================================
// LOGIN VIEW MODEL
// ============================================
export const useLoginViewModel = () => {
  const { login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof RegisterInput, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleLogin = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!validate()) {
      return { success: false, message: "Please fix the errors below" };
    }

    setIsLoading(true);
    try {
      const result = await login(formData);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [formData, login, validate]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    setFormData,
    isLoading: isLoading || authLoading,
    errors,
    handleLogin,
    clearErrors,
    updateField,
  };
};

// ============================================
// SIGNUP VIEW MODEL
// ============================================
export const useSignupViewModel = () => {
  const { register, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof RegisterInput, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSignup = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!validate()) {
      return { success: false, message: "Please fix the errors below" };
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [formData, register, validate]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    updateField,
    isLoading: isLoading || authLoading,
    errors,
    handleSignup,
    clearErrors,
  };
};

// Keep the old hook for backward compatibility
export const useAuthViewModel = useLoginViewModel;
