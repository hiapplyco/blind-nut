
import { Card } from "@/components/ui/card";
import { SearchFormProps } from "./types";
import { useSearchForm } from "./hooks/useSearchForm";
import { SearchFormContent } from "./SearchFormContent";

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId,
}: SearchFormProps) => {
  const {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    isProcessing,
    isScrapingProfiles,
    searchType,
    setSearchType,
    searchString,
    handleSubmit,
    handleFileUpload,
  } = useSearchForm(userId, onJobCreated, currentJobId);

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <SearchFormContent
        searchText={searchText}
        companyName={companyName}
        isProcessing={isProcessing}
        isScrapingProfiles={isScrapingProfiles}
        searchType={searchType}
        searchString={searchString}
        onSearchTypeChange={setSearchType}
        onSearchTextChange={setSearchText}
        onCompanyNameChange={setCompanyName}
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};

export default SearchForm;
