
import { Card } from "@/components/ui/card";
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultsList } from "./components/SearchResultsList";
import { useGoogleSearch } from "./hooks/useGoogleSearch";
import { GoogleSearchWindowProps } from "./types";
import { useEffect } from "react";

export const GoogleSearchWindow = ({ 
  searchTerm,
  searchString: initialSearchString,
  searchType = "candidates",
  jobId
}: GoogleSearchWindowProps) => {
  const { 
    results, 
    isLoading, 
    searchString, 
    setSearchString, 
    handleSearch, 
    handleLoadMore, 
    handleCopySearchString, 
    handleExport,
    totalResults
  } = useGoogleSearch(initialSearchString || searchTerm || "", searchType, jobId);

  // Trigger search automatically when a new search string is provided
  useEffect(() => {
    if ((initialSearchString || searchTerm) && (initialSearchString || searchTerm || "").trim() !== '') {
      handleSearch(1);
    }
  }, [initialSearchString, searchTerm]);

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <SearchHeader 
          searchString={searchString}
          setSearchString={setSearchString}
          handleSearch={() => handleSearch(1)}
          handleExport={handleExport}
          handleCopySearchString={handleCopySearchString}
          isLoading={isLoading}
          resultsExist={results.length > 0}
        />

        <SearchResultsList 
          results={results}
          isLoading={isLoading}
          totalResults={totalResults}
          currentResults={results.length}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoading}
          searchType={searchType}
        />
      </div>
    </Card>
  );
};
