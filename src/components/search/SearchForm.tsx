
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { SearchFormProps } from "./types"; // Props type is updated
// import { useSearchForm } from "./hooks/useSearchForm"; // Remove hook import
import { SearchFormContent } from "./SearchFormContent";

// Update component signature to accept all props from the updated SearchFormProps
export const SearchForm = memo(({
  userId, // Keep if needed by SearchFormContent directly, otherwise remove
  searchText,
  isProcessing,
  isScrapingProfiles,
  searchString,
  onSearchTextChange,
  onFileUpload,
  onSubmit,
  onTextUpdate, // Added this prop
  // Removed props no longer passed: onJobCreated, currentJobId, isProcessingComplete
}: SearchFormProps) => {
  // Remove the hook call and state derivation here
  // const { ... } = useSearchForm(...);

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Pass the received props directly down to SearchFormContent */}
      <SearchFormContent
        searchText={searchText}
        isProcessing={isProcessing}
        isScrapingProfiles={isScrapingProfiles}
        searchString={searchString}
        onSearchTextChange={onSearchTextChange}
        onFileUpload={onFileUpload}
        onSubmit={onSubmit}
        onTextUpdate={onTextUpdate} // Pass down onTextUpdate
        // Removed props no longer needed by SearchFormContent:
        // companyName, searchType, onSearchTypeChange, onCompanyNameChange
      />
    </Card>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
