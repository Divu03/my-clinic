import { DoctorClinic, GetDoctorClinicsSchema } from '../models/types';
import api from './api';

// 1. Toggle this to TRUE to bypass the network error
const USE_MOCK_DATA = true;

// 2. Hardcoded Demo Data for "Kitchener Downtown Clinic" and others
const MOCK_CLINICS_LIST: DoctorClinic[] = [
  {
    id: '1',
    name: "Kitchener Downtown Clinic",
    address: "123 King St W, Kitchener, ON",
    latitude: 43.4516,
    longitude: -80.4925,
    type: "GENERAL_PRACTICE",
    openingHours: { start: "08:00", end: "18:00" },
    description: "A premier clinic located in the heart of Kitchener offering walk-in services and family practice.",
    distance_km: 1.2,
    logo: "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg"
  },
  {
    id: '2',
    name: "Waterloo Health Centre",
    address: "200 University Ave W, Waterloo, ON",
    latitude: 43.4723,
    longitude: -80.5449,
    type: "DENTIST",
    openingHours: { start: "09:00", end: "17:00" },
    description: "Specialized dental care for students and families near the university district.",
    distance_km: 3.5,
    logo: "https://t4.ftcdn.net/jpg/04/78/33/27/360_F_478332711_zG9Gq5yX2F2G4b3i2j2.jpg"
  }
];

export const getNearbyClinics = async (params: GetDoctorClinicsSchema) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_CLINICS_LIST;
  }

  const response = await api.get('/clinics', { params });
  return response.data;
};

export const getClinicDetails = async (clinicId: string): Promise<DoctorClinic> => {
  if (USE_MOCK_DATA) {
    console.log(`Fetching details for mock clinic ID: ${clinicId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the specific clinic from our mock list
    const found = MOCK_CLINICS_LIST.find(c => c.id === clinicId);
    
    // Return the found clinic, or the first one as a fallback so the UI never crashes
    return found || MOCK_CLINICS_LIST[0];
  }

  const response = await api.get(`/clinics/${clinicId}`);
  return response.data;
};