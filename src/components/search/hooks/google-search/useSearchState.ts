
import { useState } from "react";
import { GoogleSearchState } from "./types";

/**
 * Hook for managing the search state
 */
export const useSearchState = (initialSearchString: string) => {
  const [state, setState] = useState<GoogleSearchState>({
    results: [],
    isLoading: false,
    searchString: initialSearchString || '',
    currentPage: 1,
    totalResults: 0,
    error: null
  });

  return { state, setState };
};
