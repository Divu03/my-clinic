import { useEffect, useState } from 'react';

export const useMapViewModel = () => {
  const [points, setPoints] = useState([]);

  const fetchCoordinates = async () => {
    // Replace with your actual API call
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    setPoints(data);
  };

  useEffect(() => {
    fetchCoordinates();
  }, []);

  return { points };
};