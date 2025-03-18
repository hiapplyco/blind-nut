
import { SearchResult } from "../../types";

export interface GoogleSearchResult {
  items: any[];
  searchInformation: {
    totalResults: string; // Changed from number to string to match Google CSE API response
  };
}

export interface GoogleSearchState {
  results: SearchResult[];
  isLoading: boolean;
  searchString: string;
  currentPage: number;
  totalResults: number;
  error: Error | null;
}

export interface StoredSearchResults {
  jobId: number;
  searchQuery: string;
  results: SearchResult[];
  timestamp: string;
  totalResults: number;
}
