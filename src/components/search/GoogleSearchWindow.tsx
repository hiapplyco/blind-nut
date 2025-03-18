
import { Card } from "@/components/ui/card";
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultsList } from "./components/SearchResultsList";
import { useGoogleSearch } from "./hooks/useGoogleSearch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfilesList } from "@/components/ProfileCard";
import { Loader2 } from "lucide-react";

interface GoogleSearchWindowProps {
  searchTerm?: string;
  searchString?: string;
  searchType?: 'candidates' | 'candidates-at-company' | 'companies';
  jobId?: number | null;
}

export const GoogleSearchWindow = ({ 
  searchTerm,
  searchString: initialSearchString,
  searchType = "candidates",
  jobId
}: GoogleSearchWindowProps) => {
  console.log("🔍 [DEBUG] GoogleSearchWindow rendered with props:", { 
    searchTerm, 
    initialSearchString, 
    searchType, 
    jobId 
  });

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
  } = useGoogleSearch(initialSearchString || searchTerm || "", searchType, jobId || undefined);

  console.log("🔍 [DEBUG] GoogleSearchWindow state after useGoogleSearch:", {
    resultsCount: results.length,
    isLoading,
    searchString,
    totalResults,
    currentPage,
    hasError: !!error
  });

  const [showResultsAs, setShowResultsAs] = useState<'cards' | 'list'>('cards');

  // Update search string when props change
  useEffect(() => {
    if (initialSearchString && initialSearchString !== searchString) {
      console.log("🔍 [DEBUG] Setting search string from props:", initialSearchString);
      setSearchString(initialSearchString);
    } else if (searchTerm && !initialSearchString && !searchString) {
      console.log("🔍 [DEBUG] Setting search string from search term:", searchTerm);
      setSearchString(searchTerm);
    }
  }, [initialSearchString, searchTerm, setSearchString, searchString]);

  // Show error messages
  useEffect(() => {
    if (error) {
      console.error("❌ [ERROR] Search error occurred:", error);
      toast.error(`Search failed: ${error.message || "Unknown error"}`);
    }
  }, [error]);

  // Trigger search automatically when a new search string is provided
  useEffect(() => {
    const searchStr = initialSearchString || searchString || searchTerm;
    if (searchStr && searchStr.trim() !== '' && results.length === 0 && !isLoading) {
      console.log("🔍 [DEBUG] Auto-running search for:", searchStr);
      console.log("🔍 [DEBUG] Current state before auto-search:", {
        results: results.length,
        isLoading,
        initialSearchString,
        searchString,
        searchTerm
      });
      
      const timer = setTimeout(() => {
        console.log("🔍 [DEBUG] Executing handleSearch() after timeout");
        handleSearch(1);
      }, 500); // Small delay to ensure component is mounted
      
      return () => {
        console.log("🔍 [DEBUG] Clearing search timeout");
        clearTimeout(timer);
      };
    }
  }, [initialSearchString, searchString, searchTerm, handleSearch, results.length, isLoading]);

  // Format profile data for ProfilesList component
  const formattedProfiles = results.map(result => ({
    profile_name: result.name || result.title || "",
    profile_title: result.jobTitle || result.snippet || "",
    profile_location: result.location || "",
    profile_url: result.link || result.profileUrl || "",
    relevance_score: result.relevance_score || 75
  }));

  const toggleDisplayMode = () => {
    setShowResultsAs(prev => prev === 'cards' ? 'list' : 'cards');
  };

  console.log("Current search results:", results.length > 0 ? `${results.length} results` : "No results");
  console.log("Total results:", totalResults, "Current page:", currentPage);

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

        {/* Debug info */}
        <div className="bg-blue-50 p-3 mb-2 border rounded text-xs font-mono">
          <div><strong>Debug:</strong> searchString: {searchString || "none"}</div>
          <div>initialSearchString: {initialSearchString || "none"}</div>
          <div>searchTerm: {searchTerm || "none"}</div>
          <div>isLoading: {isLoading ? "true" : "false"}</div>
          <div>totalResults: {totalResults}, resultsCount: {results.length}</div>
          {error && <div className="text-red-500">Error: {error.message}</div>}
        </div>

        <div className="flex justify-end mb-2">
          <button 
            onClick={toggleDisplayMode}
            className="text-sm text-[#8B5CF6] border border-[#8B5CF6] rounded px-3 py-1 hover:bg-[#8B5CF6]/10"
          >
            Show as {showResultsAs === 'cards' ? 'List' : 'Cards'}
          </button>
        </div>

        {/* Display loading state */}
        {isLoading && results.length === 0 && (
          <div className="flex justify-center items-center p-10">
            <div className="text-center">
              <div className="mb-4">
                <div className="h-20 w-20 mx-auto">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#8B5CF6]"></div>
                </div>
              </div>
              <p className="text-gray-500">Searching for LinkedIn profiles...</p>
            </div>
          </div>
        )}

        {/* Display error state */}
        {error && !isLoading && results.length === 0 && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-300">
            <h3 className="font-medium mb-2">Error finding profiles</h3>
            <p>{error.message}</p>
            <div className="mt-4">
              <button
                onClick={() => handleSearch(1)}
                className="px-3 py-1 bg-red-100 border border-red-300 rounded text-sm hover:bg-red-200"
              >
                Retry Search
              </button>
            </div>
          </div>
        )}

        {/* Display empty state when no results and not loading */}
        {!isLoading && results.length === 0 && !error && (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-md border border-gray-200 text-center">
            <p className="mb-2">No LinkedIn profiles found matching your search criteria.</p>
            <p>Try modifying your search terms or click the Search button to retry.</p>
          </div>
        )}

        {/* Display results when available */}
        {results.length > 0 && !isLoading && (
          <>
            {showResultsAs === 'cards' ? (
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
            
            {/* Load more button */}
            {totalResults > results.length && (
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
