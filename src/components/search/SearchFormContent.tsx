
import { memo } from "react";
import { SearchType } from "./types";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { CompanyNameInput } from "./CompanyNameInput";
import { SubmitButton } from "./SubmitButton";
import { GoogleSearchWindow } from "./GoogleSearchWindow";
import { Loader2 } from "lucide-react";

interface SearchFormContentProps {
  searchText: string;
  companyName: string;
  isProcessing: boolean;
  isScrapingProfiles: boolean;
  searchType: SearchType;
  searchString: string;
  onSearchTypeChange: (value: SearchType) => void;
  onSearchTextChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
}

const MemoizedSearchTypeToggle = memo(SearchTypeToggle);
const MemoizedFormHeader = memo(FormHeader);
const MemoizedContentTextarea = memo(ContentTextarea);
const MemoizedCompanyNameInput = memo(CompanyNameInput);
const MemoizedSubmitButton = memo(SubmitButton);
const MemoizedGoogleSearchWindow = memo(GoogleSearchWindow);

export const SearchFormContent = memo(({
  searchText,
  companyName,
  isProcessing,
  isScrapingProfiles,
  searchType,
  searchString,
  onSearchTypeChange,
  onSearchTextChange,
  onCompanyNameChange,
  onFileUpload,
  onSubmit,
  hideSearchTypeToggle = false,
  submitButtonText,
}: SearchFormContentProps) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {!hideSearchTypeToggle && (
          <MemoizedSearchTypeToggle 
            value={searchType} 
            onValueChange={onSearchTypeChange} 
          />
        )}
        
        <MemoizedFormHeader />
        
        <MemoizedContentTextarea
          searchText={searchText}
          isProcessing={isProcessing}
          onTextChange={onSearchTextChange}
          onFileUpload={onFileUpload}
          onTextUpdate={onSearchTextChange}
        />

        {searchType === "candidates-at-company" && (
          <MemoizedCompanyNameInput
            companyName={companyName}
            isProcessing={isProcessing}
            onChange={onCompanyNameChange}
          />
        )}

        <div className="space-y-4">
          <MemoizedSubmitButton 
            isProcessing={isProcessing || isScrapingProfiles}
            isDisabled={
              isProcessing || 
              isScrapingProfiles || 
              !searchText?.trim() || 
              (searchType === "candidates-at-company" && !companyName?.trim())
            }
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

      {searchString && (
        <div className="mt-6">
          <MemoizedGoogleSearchWindow searchString={searchString} />
        </div>
      )}
    </>
  );
});

SearchFormContent.displayName = 'SearchFormContent';
