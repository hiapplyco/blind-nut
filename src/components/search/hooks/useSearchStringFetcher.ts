
import { useEffect, useCallback } from "react";
import { fetchSearchString } from "./utils/fetchSearchString";

/**
 * Hook for fetching search string from a job
 */
export const useSearchStringFetcher = (
  currentJobId: number | null,
  setSearchString: (searchString: string) => void,
  onFetchComplete?: () => void
) => {
  // Fetch search string when job ID changes
  useEffect(() => {
    const getSearchString = async () => {
      const result = await fetchSearchString(currentJobId);
      if (result) {
        console.log("Search string fetched:", result);
        setSearchString(result);
        if (onFetchComplete) {
          onFetchComplete();
        }
      }
    };

    if (currentJobId) {
      console.log("Fetching search string for job ID:", currentJobId);
      getSearchString();
    }
  }, [currentJobId, setSearchString, onFetchComplete]);
};
