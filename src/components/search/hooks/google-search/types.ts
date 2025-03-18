
export interface GoogleSearchState {
  results: SearchResult[];
  isLoading: boolean;
  searchString: string;
  currentPage: number;
  totalResults: number;
}

export interface GoogleSearchResult {
  items?: any[];
  searchInformation?: {
    totalResults?: number;
  };
}

export interface GoogleSearchActions {
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (page?: number) => Promise<void>;
  handleLoadMore: () => void;
  handleCopySearchString: () => void;
  handleExport: () => void;
}

// Import necessary types from the parent types file
import { SearchResult, SearchType } from "../../types";
