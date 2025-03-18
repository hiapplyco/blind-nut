
import { Card } from "@/components/ui/card";
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultsList } from "./components/SearchResultsList";
import { useGoogleSearch } from "./hooks/useGoogleSearch";
import { GoogleSearchWindowProps } from "./types";
import { useEffect } from "react";
import { toast } from "sonner";

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
    totalResults,
    currentPage,
    error
  } = useGoogleSearch(initialSearchString || searchTerm || "", searchType, jobId);

  // Update search string when props change
  useEffect(() => {
    if (initialSearchString && initialSearchString !== searchString) {
      console.log("Setting search string from props:", initialSearchString);
      setSearchString(initialSearchString);
    } else if (searchTerm && !initialSearchString && !searchString) {
      console.log("Setting search string from search term:", searchTerm);
      setSearchString(searchTerm);
    }
  }, [initialSearchString, searchTerm, setSearchString, searchString]);

  // Show error messages
  useEffect(() => {
    if (error) {
      console.error("Search error occurred:", error);
      toast.error(`Search failed: ${error.message || "Unknown error"}`);
    }
  }, [error]);

  // Trigger search automatically when a new search string is provided
  useEffect(() => {
    const searchStr = initialSearchString || searchString || searchTerm;
    if (searchStr && searchStr.trim() !== '' && results.length === 0 && !isLoading) {
      console.log("Auto-running search for:", searchStr);
      const timer = setTimeout(() => {
        handleSearch(1);
      }, 500); // Small delay to ensure component is mounted
      
      return () => clearTimeout(timer);
    }
  }, [initialSearchString, searchString, searchTerm, handleSearch, results.length, isLoading]);

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
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
          isLoadingMore={isLoading && currentPage > 1}
          searchType={searchType}
        />
      </div>
    </Card>
  );
};
