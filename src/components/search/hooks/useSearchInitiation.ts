
import { useEffect } from "react";

/**
 * Hook for handling automatic search initiation
 */
export const useSearchInitiation = (
  searchString: string,
  initialSearchString?: string, 
  searchTerm?: string,
  results: any[] = [],
  isLoading: boolean = false,
  handleSearch: (page?: number) => void = () => {}
) => {
  // Auto-search with initialSearchString or searchTerm if provided and not loading
  useEffect(() => {
    // Check if we should auto-search
    const shouldAutoSearch = (
      // We need a search string
      searchString && 
      searchString.trim() !== '' &&
      // We don't have results yet
      results.length === 0 &&
      // We're not already loading
      !isLoading &&
      // We were given an initialSearchString or searchTerm
      (initialSearchString || searchTerm)
    );
    
    if (shouldAutoSearch) {
      console.log("🔍 [AUTO] Auto-initiating search with:", searchString);
      handleSearch(1);
    }
  }, [searchString, initialSearchString, searchTerm, results.length, isLoading, handleSearch]);
};
