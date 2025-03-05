
export type SearchType = "candidates" | "companies" | "candidates-at-company";

export interface SearchFormProps {
  userId: string;
  onJobCreated: (jobId: number, searchText: string) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle: string;
  location?: string;
}

export interface GoogleSearchWindowProps {
  searchString: string;
  searchType?: "candidates" | "companies" | "candidates-at-company";
  jobId?: number;
}

export interface SearchHeaderProps {
  searchString: string;
  setSearchString: (value: string) => void;
  handleSearch: () => void;
  handleExport: () => void;
  handleCopySearchString: () => void;
  isLoading: boolean;
  resultsExist: boolean;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  totalResults: number;
  currentResults: number;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  searchType?: "candidates" | "companies" | "candidates-at-company";
}

export interface SearchResultItemProps {
  result: SearchResult;
  searchType?: "candidates" | "companies" | "candidates-at-company";
}

export interface Profile {
  profile_name: string;
  profile_title: string;
  profile_location: string;
  profile_url: string;
  relevance_score?: number;
}

export interface EnrichedProfileData {
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  job_company_name?: string;
  industry?: string;
  job_title?: string;
  skills?: string[];
  profiles?: Array<{
    network: string;
    url: string;
    username: string;
  }>;
}
