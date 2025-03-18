
import { useEffect } from 'react';

export const useSearchInitiation = (
  searchString: string,
  initialSearchString?: string,
  searchTerm?: string,
  results?: any[],
  isLoading?: boolean,
  handleSearch?: (page: number) => void
) => {
  // Trigger search automatically when a new search string is provided
  useEffect(() => {
    const searchStr = initialSearchString || searchString || searchTerm;
    if (searchStr && searchStr.trim() !== '' && (!results || results.length === 0) && !isLoading && handleSearch) {
      console.log("🔍 [CRITICAL] Auto-running search for:", searchStr);
      console.log("🔍 [DEBUG] Current state before auto-search:", {
        results: results?.length || 0,
        isLoading,
        initialSearchString,
        searchString,
        searchTerm
      });
      
      // Add immediate search trigger
      console.log("🔍 [CRITICAL] Executing handleSearch() immediately");
      handleSearch(1);
    }
  }, [initialSearchString, searchString, searchTerm, handleSearch, results, isLoading]);
};
