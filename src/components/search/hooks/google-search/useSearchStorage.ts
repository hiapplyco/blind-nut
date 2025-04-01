
import { useEffect } from "react";
import { useStoredResults } from "./useStoredResults";

/**
 * Hook for handling persistence of search results
 */
export const useSearchStorage = (
  jobId: number | undefined,
  results: any[],
  searchString: string,
  totalResults: number
) => {
  const { getStoredResults, saveResults, appendResults } = useStoredResults(jobId);

  // Save results to store when they change
  useEffect(() => {
    if (jobId && results.length > 0) {
      console.log("Saving search results to store for jobId:", jobId);
      saveResults(results, searchString, totalResults);
    }
  }, [jobId, results, searchString, totalResults, saveResults]);

  return {
    getStoredResults,
    saveResults,
    appendResults
  };
};
