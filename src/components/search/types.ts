import { ReactNode } from "react";

export type SearchType = "candidates" | "candidates-at-company" | "companies" | "news";

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

export interface ContactCardProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  isLoading: boolean;
  error: string | null;
  profileName: string;
}
