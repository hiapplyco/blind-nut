
import { Card } from "@/components/ui/card";
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultsList } from "./components/SearchResultsList";
import { useGoogleSearch } from "./hooks/useGoogleSearch";
import { GoogleSearchWindowProps } from "./types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfilesList } from "@/components/ProfileCard";

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

  const [showResultsAs, setShowResultsAs] = useState<'cards' | 'list'>('cards');

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

  // Format profile data for ProfilesList component
  const formattedProfiles = results.map(result => ({
    profile_name: result.name || result.title || "",
    profile_title: result.snippet || "",
    profile_location: result.location || "",
    profile_url: result.link || result.profileUrl || "",
    relevance_score: result.relevance_score || 75
  }));

  const toggleDisplayMode = () => {
    setShowResultsAs(prev => prev === 'cards' ? 'list' : 'cards');
  };

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

        <div className="flex justify-end mb-2">
          <button 
            onClick={toggleDisplayMode}
            className="text-sm text-[#8B5CF6] border border-[#8B5CF6] rounded px-3 py-1 hover:bg-[#8B5CF6]/10"
          >
            Show as {showResultsAs === 'cards' ? 'List' : 'Cards'}
          </button>
        </div>

        {showResultsAs === 'cards' && formattedProfiles.length > 0 ? (
          <ProfilesList profiles={formattedProfiles} />
        ) : (
          <SearchResultsList 
            results={results}
            isLoading={isLoading}
            totalResults={totalResults}
            currentResults={results.length}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoading && currentPage > 1}
            searchType={searchType}
          />
        )}

        {/* Show loading or empty state if needed */}
        {isLoading && results.length === 0 && (
          <div className="flex justify-center items-center p-10">
            <div className="text-center">
              <div className="mb-4">
                <div className="h-20 w-20 mx-auto">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#8B5CF6]"></div>
                </div>
              </div>
              <p className="text-gray-500">Generating LinkedIn profiles...</p>
            </div>
          </div>
        )}

        {/* Load more button */}
        {results.length > 0 && !isLoading && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors"
            >
              Load More Results
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
