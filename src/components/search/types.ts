
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
  htmlTitle?: string;
}

// Profile types
export interface Profile {
  id: string;
  name: string;
  title: string;
  location: string;
  profile_name: string;
  profile_title: string;
  profile_location: string;
  profile_url: string;
  relevance_score: number;
  work_email?: string;
  phone_numbers?: string[];
}

// Search form types
export type SearchType = "candidates" | "candidates-at-company" | "companies" | "news" | "jobs";

export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText?: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
  onSubmitStart?: () => void;
  onShowGoogleSearch?: (searchString: string) => void;
}

export interface GoogleSearchWindowProps {
  searchTerm?: string;
  searchString?: string;
  searchType?: SearchType;
  jobId?: number;
}

export interface SearchHeaderProps {
  searchString: string;
  setSearchString?: (value: string) => void;
  handleSearch?: () => void;
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
  searchType: SearchType;
}

export interface SearchResultItemProps {
  result: SearchResult;
  searchType: SearchType;
}

// Enriched profile types
export interface EnrichedProfileData {
  profile?: Profile;
  name?: string;
  first_name?: string;
  last_name?: string;
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  phone_numbers?: string[];
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  job_title?: string;
  job_company_name?: string;
  industry?: string;
  company_size?: string;
  skills?: string[];
  languages?: Language[];
  education?: Education[];
  experience?: Experience[];
  profiles?: SocialProfile[];
  social_profiles?: SocialProfile[];
}

export interface Language {
  language: string;
  proficiency?: string;
}

export interface Education {
  school?: string;
  institution?: string;
  degree?: string;
  field?: string;
  field_of_study?: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
}

export interface Experience {
  title: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
  username?: string;
}
