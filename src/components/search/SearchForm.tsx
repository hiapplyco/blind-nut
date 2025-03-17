
import React, { useState } from "react";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { CompanyNameInput } from "./CompanyNameInput";
import { SubmitButton } from "./SubmitButton";
import { SearchType } from "./types";
import { Loader2 } from "lucide-react";
import { useFormState } from "./hooks/useFormState";
import { useFormSubmit } from "./hooks/useFormSubmit";
import { processFileUpload } from "./hooks/utils/processFileUpload";

interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText: string, data?: any) => void;
  currentJobId?: number | null;
  isProcessingComplete?: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
  onSubmitStart?: () => void;
}

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId, 
  isProcessingComplete,
  source = 'default',
  hideSearchTypeToggle = false,
  submitButtonText,
  onSubmitStart
}: SearchFormProps) => {
  const { searchType, setSearchType, searchText, setSearchText, companyName, setCompanyName } = useFormState(currentJobId || null, () => Promise.resolve(null));
  const { isProcessing, setIsProcessing, handleSubmit } = useFormSubmit(userId, onJobCreated, source);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (onSubmitStart) {
      onSubmitStart();
    }
    await handleSubmit(e, searchText, searchType, companyName);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processFileUpload(
      event.target.files?.[0],
      userId,
      setSearchText,
      setIsProcessing
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {!hideSearchTypeToggle && (
        <SearchTypeToggle 
          value={searchType} 
          onValueChange={setSearchType} 
        />
      )}
      
      <FormHeader />
      
      <ContentTextarea
        searchText={searchText}
        isProcessing={isProcessing}
        onTextChange={setSearchText}
        onFileUpload={handleFileUpload}
        onTextUpdate={setSearchText}
      />

      {searchType === "candidates-at-company" && (
        <CompanyNameInput
          companyName={companyName}
          isProcessing={isProcessing}
          onChange={setCompanyName}
        />
      )}

      <div className="space-y-4">
        <SubmitButton 
          isProcessing={isProcessing || isScrapingProfiles}
          isDisabled={isProcessing || isScrapingProfiles || !searchText?.trim() || (searchType === "candidates-at-company" && !companyName?.trim())}
          buttonText={submitButtonText}
        />
        
        {isScrapingProfiles && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scraping profiles from search results...</span>
          </div>
        )}
      </div>
    </form>
  );
};
