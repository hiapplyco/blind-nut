
import { useCallback } from "react";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { SearchResult } from "../../types";

export const useStoredResults = (jobId?: number) => {
  const { 
    setSearchResults, 
    getSearchResults, 
    addToSearchResults 
  } = useClientAgentOutputs();

  /**
   * Retrieves stored search results for a job ID
   */
  const getStoredResults = useCallback(() => {
    if (!jobId) return null;
    
    const storedData = getSearchResults(jobId);
    if (storedData) {
      console.log("Loading stored data for jobId:", jobId, storedData);
      return storedData;
    }
    
    return null;
  }, [jobId, getSearchResults]);

  /**
   * Saves search results to store
   */
  const saveResults = useCallback((
    results: SearchResult[], 
    searchString: string, 
    totalResults: number
  ) => {
    if (!jobId) return;
    
    console.log("Saving search results to store for jobId:", jobId);
    setSearchResults(jobId, results, searchString, totalResults);
  }, [jobId, setSearchResults]);

  /**
   * Adds additional results to existing results
   */
  const appendResults = useCallback((newResults: SearchResult[]) => {
    if (!jobId) return;
    
    addToSearchResults(jobId, newResults);
  }, [jobId, addToSearchResults]);

  return {
    getStoredResults,
    saveResults,
    appendResults
  };
};
