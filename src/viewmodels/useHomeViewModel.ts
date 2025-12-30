import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { DoctorClinic } from '../models/types';
import { getNearbyClinics } from '../services/clinicService';

// Set this to true to see markers without a working backend
const USE_MOCK_DATA = true;

const MOCK_CLINICS: DoctorClinic[] = [
  {
    id: '1',
    name: "Kitchener Downtown Clinic",
    latitude: 43.4516,
    longitude: -80.4925,
    type: "GENERAL_PRACTICE",
    openingHours: { start: "08:00", end: "18:00" },
    description: "Centrally located clinic for general health checkups."
  },
  {
    id: '2',
    name: "Waterloo Health Centre",
    latitude: 43.4723,
    longitude: -80.5449,
    type: "DENTIST",
    openingHours: { start: "09:00", end: "17:00" },
    description: "Specialized dental care near the university."
  }
];

export const useHomeViewModel = () => {
  const [clinics, setClinics] = useState<DoctorClinic[]>([]); 
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchNearbyClinics = async (currentRadius: number) => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setClinics(MOCK_CLINICS);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      
      const data = await getNearbyClinics({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: currentRadius,
        page: 1,
        limit: 10
      });

      setClinics(data);
    } catch (error) {
      console.error("API Error, falling back to mock:", error);
      setClinics(MOCK_CLINICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyClinics(radius);
  }, [radius]);

  return { clinics, radius, setRadius, loading };
};