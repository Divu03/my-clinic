import { z } from "zod";

// ============================================
// ENUMS
// ============================================
export const ClinicType = {
  GENERAL_PRACTICE: "GENERAL_PRACTICE",
  PEDIATRICS: "PEDIATRICS",
  DERMATOLOGY: "DERMATOLOGY",
  PSYCHIATRY: "PSYCHIATRY",
  GYNECOLOGY: "GYNECOLOGY",
  ORTHOPEDICS: "ORTHOPEDICS",
  ENT: "ENT",
  DENTIST: "DENTIST",
} as const;

export type ClinicTypeValue = (typeof ClinicType)[keyof typeof ClinicType];

export const TokenStatus = {
  WAITING: "WAITING",
  CALLED: "CALLED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
} as const;

export type TokenStatusValue = (typeof TokenStatus)[keyof typeof TokenStatus];

export const UserRole = {
  PATIENT: "PATIENT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(3, "First name must be at least 3 characters"),
    lastName: z.string().min(3, "Last name must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Clinic Query Schema
export const getClinicsQuerySchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  query: z.string().optional(),
  type: z.nativeEnum(ClinicType).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GetClinicsQuery = z.infer<typeof getClinicsQuerySchema>;

// ============================================
// INTERFACES
// ============================================

// User
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleValue;
  clinicId: string | null;
  profilePicture?: string;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// Clinic / DoctorClinic
export interface Clinic {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logo?: string;
  images?: string[];
  type: ClinicTypeValue;
  openingHours: { start: string; end: string };
  distance_km?: number;
}

// Alias for backward compatibility
export type DoctorClinic = Clinic;

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Clinics Response
export interface ClinicsResponse {
  success: boolean;
  data: {
    clinics: Clinic[];
    pagination: Pagination;
  };
}

// Queue
export interface Queue {
  id: string;
  clinicId: string;
  queueDate: string;
  currentTokenNo: number;
  maxQueueSize: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Queue Status
export interface QueueStatus {
  queueId: string;
  currentTokenNo: number;
  waitingCount: number;
  startTime?: string;
  endTime?: string;
  estimatedWaitTime?: number;
}

// Token
export interface Token {
  id: string;
  queueId: string;
  patientId: string;
  tokenNumber: number;
  status: TokenStatusValue;
  createdAt?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Device Info for auth
export interface DeviceInfo {
  userAgent: string;
  platform?: string;
}

// ============================================
// DEPRECATED - Keep for backward compatibility
// ============================================
export const getDoctorClinicsSchema = getClinicsQuerySchema;
export type GetDoctorClinicsSchema = GetClinicsQuery;
