import React, { useState } from "react";
import { SearchFormHeader } from "./SearchFormHeader";
import { SearchFormContent } from "./SearchFormContent";
import { SearchFormSubmit } from "./SearchFormSubmit";
import { SearchType } from "./hooks/types";
import { useFormState } from "./hooks/useFormState";
import { useFormSubmit } from "./hooks/useFormSubmit";

interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, searchText: string, data?: any) => void;
  currentJobId?: number | null;
  isProcessingComplete?: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
  onSubmitStart?: () => void;  // Add this new prop
}

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId, 
  isProcessingComplete,
  source = 'default',
  hideSearchTypeToggle = false,
  submitButtonText,
  onSubmitStart  // Add this new prop
}: SearchFormProps) => {
  const { searchType, setSearchType, searchText, setSearchText, companyName, setCompanyName } = useFormState();
  const { isProcessing, setIsProcessing, handleSubmit } = useFormSubmit(userId, onJobCreated, source);

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (onSubmitStart) {
      onSubmitStart();  // Call this at the beginning of form submission
    }
    await handleSubmit(e, searchText, searchType, companyName);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <SearchFormHeader 
        searchType={searchType} 
        setSearchType={setSearchType} 
        hideSearchTypeToggle={hideSearchTypeToggle}
      />
      <SearchFormContent 
        searchText={searchText} 
        setSearchText={setSearchText} 
        companyName={companyName} 
        setCompanyName={setCompanyName} 
        searchType={searchType}
      />
      <SearchFormSubmit 
        isProcessing={isProcessing} 
        currentJobId={currentJobId} 
        isProcessingComplete={isProcessingComplete}
        submitButtonText={submitButtonText}
      />
    </form>
  );
};
