
import { ReactNode } from "react";

export type SearchType = "candidates" | "candidates-at-company" | "companies" | "news" | "jobs";

export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete?: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
  onSubmitStart?: () => void;
  onShowGoogleSearch?: (searchString: string) => void;
}

export interface SearchFormHeaderProps {
  isProcessingComplete?: boolean;
}

export interface ContentTextareaProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isActive?: boolean;
}

export interface CompanyNameInputProps {
  companyName: string;
  onChange: (name: string) => void;
  isProcessing: boolean;
}

export interface SubmitButtonProps {
  isProcessing: boolean;
  isDisabled: boolean;
  buttonText?: string;
}

export interface GoogleSearchWindowProps {
  searchTerm?: string;
  searchString?: string;
  searchType?: SearchType;
  jobId?: number | null;
}

export interface SearchResult {
  title?: string;
  name?: string;
  link?: string;
  profileUrl?: string;
  snippet?: string;
  htmlTitle?: string;
  location?: string;
  [key: string]: any;
}

export interface SearchResultItemProps {
  result: SearchResult;
  searchType?: SearchType;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  totalResults?: number;
  currentResults?: number;
  onLoadMore: () => void;
  isLoadingMore?: boolean;
  searchType?: SearchType;
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

// New interfaces for profile and contact information
export interface Profile {
  id: string;
  name?: string;
  title?: string;
  location?: string;
  profile_name?: string;
  profile_title?: string;
  profile_location?: string;
  profile_url?: string;
  relevance_score?: number;
  [key: string]: any;
}

export interface SocialProfile {
  network: string;
  url: string;
  username?: string;
}

export interface Education {
  school?: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  field?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
}

export interface Experience {
  title: string;
  company?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  description?: string;
}

export interface EnrichedProfileData {
  profile?: Profile;
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  phone_numbers?: string[];
  job_title?: string;
  job_company_name?: string;
  industry?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  company_size?: string;
  skills?: string[];
  languages?: string[];
  education?: Education[];
  experience?: Experience[];
  profiles?: SocialProfile[];
  social_profiles?: SocialProfile[];
  [key: string]: any;
}

export interface ContactCardProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: EnrichedProfileData | null;
  isLoading: boolean;
  error: string | null;
  profileName: string;
}
