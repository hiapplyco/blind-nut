
import { useEffect } from "react";
import { cleanSearchString } from "./utils";
import { SearchType } from "../../types";

/**
 * Hook for handling search initialization from props and stored data
 */
export const useSearchInitialization = (
  initialSearchString: string,
  searchString: string,
  getStoredResults: () => any,
  saveResults: (results: any[], searchQuery: string, totalResults: number) => void,
  setState: (updater: (prev: any) => any) => void,
  jobId?: number,
  resultsPerPage: number = 10
) => {
  // Set initial search string
  useEffect(() => {
    if (initialSearchString && initialSearchString.trim() !== '') {
      // Remove site:linkedin.com/in/ from the displayed search string
      const cleanedString = cleanSearchString(initialSearchString);
      setState(prev => ({ ...prev, searchString: cleanedString }));
      console.log("Initial search string set to:", cleanedString);
    }
  }, [initialSearchString, setState]);

  // Initialize from jobId if available
  useEffect(() => {
    if (jobId) {
      const storedData = getStoredResults();
      if (storedData) {
        setState(prev => ({
          ...prev,
          results: storedData.results,
          searchString: storedData.searchQuery ? cleanSearchString(storedData.searchQuery) : prev.searchString,
          totalResults: storedData.totalResults,
          currentPage: Math.ceil(storedData.results.length / resultsPerPage) || 1
        }));
      }
    }
  }, [jobId, getStoredResults, setState, resultsPerPage]);

  // Update when initialSearchString changes
  useEffect(() => {
    if (initialSearchString && initialSearchString.trim() !== '') {
      console.log("Updating search string from initialSearchString:", initialSearchString);
      const cleanedSearchString = cleanSearchString(initialSearchString);
      
      if (searchString !== cleanedSearchString) {
        setState(prev => ({
          ...prev,
          searchString: cleanedSearchString,
          results: [],
          currentPage: 1,
          totalResults: 0,
          error: null
        }));
        
        if (jobId) {
          saveResults([], cleanedSearchString, 0);
        }
      }
    }
  }, [initialSearchString, saveResults, jobId, searchString, setState]);
};
