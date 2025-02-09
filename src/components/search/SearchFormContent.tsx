
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
}

export const SearchFormContent = ({
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
}: SearchFormContentProps) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <SearchTypeToggle 
          value={searchType} 
          onValueChange={onSearchTypeChange} 
        />
        
        <FormHeader />
        
        <ContentTextarea
          searchText={searchText}
          isProcessing={isProcessing}
          onTextChange={onSearchTextChange}
          onFileUpload={onFileUpload}
          onTextUpdate={onSearchTextChange}
        />

        {searchType === "candidates-at-company" && (
          <CompanyNameInput
            companyName={companyName}
            isProcessing={isProcessing}
            onChange={onCompanyNameChange}
          />
        )}

        <div className="space-y-4">
          <SubmitButton 
            isProcessing={isProcessing || isScrapingProfiles}
            isDisabled={
              isProcessing || 
              isScrapingProfiles || 
              !searchText?.trim() || 
              (searchType === "candidates-at-company" && !companyName?.trim())
            }
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
          <GoogleSearchWindow searchString={searchString} />
        </div>
      )}
    </>
  );
};
