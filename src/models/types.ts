import { z } from "zod";

export const getDoctorClinicsSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type GetDoctorClinicsSchema = z.infer<typeof getDoctorClinicsSchema>;

export interface DoctorClinic {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: string;
  logo?: string;
  description?: string;
  openingHours: { start: string; end: string }; // Matches your Prisma Json
  distance_km?: number; // Added this because your Backend SQL calculates it
}

export interface Token {
  id: string;
  tokenNumber: number;
  status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  queueId: string;
  patientId: string;
}

export interface QueueStatus {
  queueId: string;
  currentTokenNo: number;
  waitingCount: number;
  estimatedWaitTime?: number;
}