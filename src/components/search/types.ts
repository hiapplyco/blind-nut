
export type SearchType = 'candidates' | 'candidates-at-company' | 'jobs';

export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText?: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
  source?: 'default' | 'clarvida';
}

// Profile types
export interface Profile {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  phone?: string;
  // Fields for the ProfileCard component
  profile_name?: string;
  profile_title?: string;
  profile_location?: string;
  profile_url?: string;
  relevance_score?: number;
}

export interface EnrichedProfileData {
  profile: Profile;
  contact_info?: any;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  social_profiles?: SocialProfile[];
  // Additional properties
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  phone_numbers?: string[];
  job_company_name?: string;
  industry?: string;
  job_title?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  company_size?: string;
  languages?: string[];
  profiles?: SocialProfile[];
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  // For compatibility with existing components
  start_date?: string;
  end_date?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  // For compatibility with existing components
  school?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
  username?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  profileUrl?: string;
  // Additional properties for Google search results
  link?: string;
  htmlTitle?: string;
  snippet?: string;
}

export interface GoogleSearchWindowProps {
  searchTerm?: string;
  searchString?: string;
  onClose?: () => void;
  searchType?: SearchType;
  jobId?: number;
}

export interface SearchHeaderProps {
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  // Additional properties for Google search header
  searchString?: string;
  setSearchString?: React.Dispatch<React.SetStateAction<string>>;
  handleSearch?: () => void | Promise<void>;
  handleExport?: () => void;
  handleCopySearchString?: () => void;
  isLoading?: boolean;
  resultsExist?: boolean;
}

export interface SearchResultItemProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
  searchType?: SearchType;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  onSelectResult?: (result: SearchResult) => void;
  isLoading?: boolean;
  totalResults?: number;
  currentResults?: number;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  searchType?: SearchType;
}
