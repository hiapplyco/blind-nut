
import { useCallback } from "react";
import { useSearchFormState } from "./useSearchFormState";
import { useSearchStringFetcher } from "./useSearchStringFetcher";
import { useFileUploadHandler } from "./useFileUploadHandler";
import { useSearchFormSubmitter } from "./useSearchFormSubmitter";
import { SearchType } from "../types";

export const useSearchForm = (
  userId: string | null,
  onJobCreated: (jobId: number, searchText: string, data?: any) => void,
  currentJobId: number | null,
  source: 'default' | 'clarvida' = 'default',
  onSubmitStart?: () => void
) => {
  // Use the form state hook
  const {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    searchType,
    setSearchType,
    searchString,
    setSearchString
  } = useSearchFormState();

  // Use the search string fetcher hook
  useSearchStringFetcher(currentJobId, setSearchString);

  // Use the form submission hook
  const {
    isProcessing,
    setIsProcessing,
    handleSubmit: submitForm
  } = useSearchFormSubmitter(userId, onJobCreated, source, onSubmitStart);

  // Use the file upload hook
  const handleFileUpload = useFileUploadHandler(userId, setSearchText, setIsProcessing);

  // Create a wrapper for the submit form function
  const handleSubmit = useCallback((e: React.FormEvent) => {
    return submitForm(e, searchText, searchType, companyName);
  }, [submitForm, searchText, searchType, companyName]);

  return {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    isProcessing,
    searchType,
    setSearchType,
    searchString,
    setSearchString,
    handleSubmit,
    handleFileUpload
  };
};
