export type SearchType = "candidates" | "candidates-at-company";

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
  searchType?: "candidates" | "candidates-at-company";
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
  searchType?: "candidates" | "candidates-at-company";
}

export interface SearchResultItemProps {
  result: SearchResult;
  searchType?: "candidates" | "candidates-at-company";
}

export interface Profile {
  profile_name: string;
  profile_title: string;
  profile_location: string;
  profile_url: string;
  relevance_score?: number;
}

export interface Education {
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
}

export interface Experience {
  title: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
  username: string;
}

export interface EnrichedProfileData {
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  phone_numbers?: string[];    // Added phone_numbers array from Nymeria API
  job_title?: string;
  job_company_name?: string;
  company_size?: string;
  industry?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  skills?: string[];
  languages?: string[];
  education?: Education[];
  experience?: Experience[];
  profiles?: SocialProfile[];
}
