
export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText?: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
}
