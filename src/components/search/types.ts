export type SearchType = 'candidates' | 'candidates-at-company' | 'companies';

// Props interfaces for components
export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, text: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete?: boolean;
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
  jobId?: number | null;
}

export interface SearchHeaderProps {
  searchString: string;
  setSearchString?: (value: React.SetStateAction<string>) => void;
  handleSearch?: () => void;
  handleExport: () => void;
  handleCopySearchString: () => void;
  isLoading: boolean;
  resultsExist: boolean;
}

export interface SearchResultItemProps {
  result: SearchResult;
  isLoading?: boolean;
  searchType?: string;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  totalResults: number;
  currentResults: number;
  onLoadMore: () => void;
  searchType?: string;
}

// Profile and contact data interfaces
export interface Profile {
  profile_name: string;
  profile_title?: string;
  profile_location?: string;
  profile_url: string;
  relevance_score?: number;
}

export interface EnrichedProfileData {
  name: string;
  emails?: string[];
  work_email?: string;
  personal_emails?: string[];
  phone_numbers?: string[];
  location?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  website?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  languages?: Language[];
  social_profiles?: SocialProfile[];
  summary?: string;
  industry?: string;
  enriched?: boolean;
}

export interface Education {
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Experience {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  location?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
  username?: string;
}

export interface Language {
  language: string;
  proficiency?: string;
}

// Search result interface
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  name: string;
  location: string;
  relevance_score: number;
  jobTitle?: string;
  profileUrl?: string;
  [key: string]: any;
}
