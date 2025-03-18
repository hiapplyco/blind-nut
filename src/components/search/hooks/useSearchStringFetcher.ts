
import { useEffect, useCallback } from "react";
import { fetchSearchString } from "./utils/fetchSearchString";

/**
 * Hook for fetching search string from a job
 */
export const useSearchStringFetcher = (
  currentJobId: number | null,
  setSearchString: (searchString: string) => void
) => {
  // Fetch search string when job ID changes
  useEffect(() => {
    const getSearchString = async () => {
      const result = await fetchSearchString(currentJobId);
      if (result) {
        setSearchString(result);
      }
    };

    getSearchString();
  }, [currentJobId, setSearchString]);
};
