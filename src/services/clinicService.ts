import { GetDoctorClinicsSchema } from '../models/types';
import api from './api';

export const getNearbyClinics = async (params: GetDoctorClinicsSchema) => {
  // Pass latitude, longitude, and radius as query params
  const response = await api.get('/clinics', { params });
  return response.data;
};

export const getClinicDetails = async (clinicId: string) => {
  const response = await api.get(`/clinics/${clinicId}`);
  return response.data;
};