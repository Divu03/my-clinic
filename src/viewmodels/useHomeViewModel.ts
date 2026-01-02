import { useCallback, useEffect, useRef, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Clinic } from "../models/types";

// ============================================
// CONSTANTS
// ============================================
const PAGE_LIMIT = 15;

// ============================================
// HOME VIEW MODEL
// ============================================
export const useHomeViewModel = () => {
  // Local state for pagination and UI
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination - use refs to avoid stale closures in callbacks
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  // Get shared data from context
  const {
    clinics, // Shared clinics from context
    loading, // Shared loading state
    refreshClinics, // Shared refresh function
    userLocation,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    radius,
    setRadius,
    showAllClinics,
    setShowAllClinics,
    showFilters,
    setShowFilters,
    clearFilters,
    radiusRef,
    showAllClinicsRef,
    userLocationRef,
  } = useFilters();

  // ============================================
  // APPLY LOCAL FILTERS (type + search) - Client-side filtering
  // ============================================
  useEffect(() => {
    let result = [...clinics];

    // Filter by type (if not already filtered by API)
    if (selectedType) {
      result = result.filter((clinic) => clinic.type === selectedType);
    }

    // Filter by search query (if not already filtered by API)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(query) ||
          clinic.address?.toLowerCase().includes(query) ||
          clinic.type.toLowerCase().includes(query)
      );
    }

    setFilteredClinics(result);
  }, [clinics, selectedType, searchQuery]);

  // ============================================
  // REFRESH
  // ============================================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    await refreshClinics();
    setRefreshing(false);
  }, [refreshClinics]);

  // ============================================
  // APPLY FILTERS (from modal)
  // ============================================
  const applyFilters = useCallback(async () => {
    setShowFilters(false);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    // Explicitly refresh clinics when Apply is clicked
    await refreshClinics();
  }, [setShowFilters, refreshClinics]);

  // ============================================
  // LOAD MORE (Infinite Scroll) - For future pagination support
  // ============================================
  const loadMore = useCallback(() => {
    // TODO: Implement pagination if needed
    // For now, all clinics are loaded at once from context
    if (loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }
    console.log("Load more - pagination not yet implemented");
  }, []);

  return {
    // Data - use filtered clinics for display
    clinics: filteredClinics,
    allClinics: clinics, // Raw clinics from context
    userLocation,

    // State - use shared loading from context
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,

    // Filters (from shared context)
    radius,
    setRadius,
    showAllClinics,
    setShowAllClinics,
    showFilters,
    setShowFilters,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,

    // Actions
    fetchClinics: refreshClinics,
    onRefresh,
    applyFilters,
    clearFilters,
    loadMore,
  };
};

export default useHomeViewModel;
