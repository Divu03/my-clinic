import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { DoctorClinic } from '../models/types'; // Make sure this path is correct
import { getNearbyClinics } from '../services/clinicService';

export const useHomeViewModel = () => {
  // FIX: Explicitly type the state as DoctorClinic[]
  const [clinics, setClinics] = useState<DoctorClinic[]>([]); 
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchNearbyClinics = async (currentRadius: number) => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn("Location permission denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Using your API service
      const data = await getNearbyClinics({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: currentRadius,
        page: 1,
        limit: 10,
      });

      setClinics(data);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyClinics(radius);
  }, [radius]);

  return { clinics, radius, setRadius, loading };
};