
export type SearchType = "candidates" | "companies" | "candidates-at-company";

export interface SearchFormProps {
  userId: string; // Keep userId if needed directly by SearchForm/Content
  // Removed props handled by parent (NewSearchForm):
  // onJobCreated: (jobId: number, searchText: string) => void;
  // currentJobId: number | null;
  // isProcessingComplete: boolean;

  // Added props passed down from parent (NewSearchForm)
  searchText: string;
  isProcessing: boolean;
  isScrapingProfiles: boolean;
  searchString: string;
  onSearchTextChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTextUpdate: (text: string) => void;
}
