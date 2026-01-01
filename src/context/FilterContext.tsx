import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Location from "expo-location";
import { Clinic, ClinicTypeValue } from "../models/types";
import { ClinicService } from "../services/clinicService";

// ============================================
// FILTER CONTEXT TYPES
// ============================================
interface FilterContextType {
  // Location
  userLocation: { latitude: number; longitude: number } | null;
  fetchLocation: () => Promise<{ latitude: number; longitude: number } | null>;

  // Filters
  radius: number;
  setRadius: (radius: number) => void;
  showAllClinics: boolean;
  setShowAllClinics: (show: boolean) => void;
  selectedType: ClinicTypeValue | null;
  setSelectedType: (type: ClinicTypeValue | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter Modal
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Shared Clinics Data
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  refreshClinics: () => Promise<void>;

  // Refs for callbacks
  radiusRef: React.MutableRefObject<number>;
  showAllClinicsRef: React.MutableRefObject<boolean>;
  userLocationRef: React.MutableRefObject<{ latitude: number; longitude: number } | null>;

  // Actions
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType>({} as FilterContextType);

// ============================================
// FILTER PROVIDER
// ============================================
export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  // Location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Filter states
  const [radius, setRadiusState] = useState(50);
  const [showAllClinics, setShowAllClinicsState] = useState(false);
  const [selectedType, setSelectedType] = useState<ClinicTypeValue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Shared clinics state
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable access in callbacks (avoid stale closures)
  const radiusRef = useRef(50);
  const showAllClinicsRef = useRef(false);
  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const isFetchingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  useEffect(() => {
    showAllClinicsRef.current = showAllClinics;
  }, [showAllClinics]);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // ============================================
  // SETTERS WITH REF SYNC
  // ============================================
  const setRadius = useCallback((value: number) => {
    setRadiusState(value);
    radiusRef.current = value;
  }, []);

  const setShowAllClinics = useCallback((value: boolean) => {
    setShowAllClinicsState(value);
    showAllClinicsRef.current = value;
  }, []);

  // ============================================
  // FETCH LOCATION
  // ============================================
  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      userLocationRef.current = coords;
      return coords;
    } catch (err) {
      console.error("Failed to get location:", err);
      return null;
    }
  }, []);

  // ============================================
  // FETCH CLINICS (Shared function)
  // ============================================
  const refreshClinics = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log("FilterContext: Already fetching, skipping...");
      return;
    }
    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Get location if needed
      let location = userLocationRef.current;
      if (!location && !showAllClinicsRef.current) {
        location = await fetchLocation();
      }

      // Build query params
      const params: any = {
        page: 1,
        limit: 50, // Fetch more for map view
      };

      // Add type filter if selected
      if (selectedType) {
        params.type = selectedType;
      }

      // Add search query if provided
      if (searchQuery) {
        params.query = searchQuery;
      }

      // Add location filter if not showing all clinics
      if (!showAllClinicsRef.current && location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
        params.radius = radiusRef.current;
      }

      console.log("FilterContext: Fetching clinics with params:", JSON.stringify(params, null, 2));
      const response = await ClinicService.getClinics(params);
      const fetchedClinics = response.clinics;

      console.log(`FilterContext: Fetched ${fetchedClinics.length} clinics`);
      setClinics(fetchedClinics);
    } catch (err) {
      console.error("Failed to fetch clinics:", err);
      setError("Failed to load clinics");
      setClinics([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchLocation, selectedType, searchQuery]);

  // ============================================
  // INITIAL LOAD ONLY
  // ============================================
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Initial load only
    refreshClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // AUTO-REFRESH ONLY FOR SEARCH QUERY (as user types)
  // ============================================
  useEffect(() => {
    // Only auto-refresh for search query changes (debounced)
    if (!isInitializedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      refreshClinics();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ============================================
  // CLEAR FILTERS
  // ============================================
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedType(null);
    setRadius(10);
    setShowAllClinics(false);
  }, [setRadius, setShowAllClinics]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: FilterContextType = {
    // Location
    userLocation,
    fetchLocation,

    // Filters
    radius,
    setRadius,
    showAllClinics,
    setShowAllClinics,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,

    // Modal
    showFilters,
    setShowFilters,

    // Shared Clinics
    clinics,
    loading,
    error,
    refreshClinics,

    // Refs
    radiusRef,
    showAllClinicsRef,
    userLocationRef,

    // Actions
    clearFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }

  return context;
};

export default FilterContext;
