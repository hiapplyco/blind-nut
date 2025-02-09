
export type SearchType = "candidates" | "companies" | "candidates-at-company";

export interface SearchFormProps {
  userId: string;
  onJobCreated: (jobId: number, searchText: string) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
}
