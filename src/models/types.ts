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
  openingHours: { start: string; end: string };
}

export interface Token {
  id: string;
  tokenNumber: number;
  status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
}