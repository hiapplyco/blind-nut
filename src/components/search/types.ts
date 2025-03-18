export interface GoogleSearchResult {
  items: any[];
  searchInformation: {
    totalResults: number;
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

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  // Additional properties for LinkedIn profiles
  name?: string;
  jobTitle?: string;
  location?: string;
  profileUrl?: string;
  relevance_score?: number;
  work_email?: string;
  phone_numbers?: string[];
  enriched?: boolean;
}
