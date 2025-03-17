
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
  // Add other profile properties as needed
}

export interface EnrichedProfileData {
  profile: Profile;
  contact_info?: any;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  social_profiles?: SocialProfile[];
  // Add other enriched data properties as needed
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
}

export interface SearchResult {
  id: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  profileUrl?: string;
  // Add other search result properties as needed
}

export interface GoogleSearchWindowProps {
  searchTerm: string;
  onClose: () => void;
}

export interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  isLoading?: boolean;
}
