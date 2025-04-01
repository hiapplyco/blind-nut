import { Card } from "@/components/ui/card";
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultsList } from "./components/SearchResultsList";
import { useGoogleSearch } from "./hooks/useGoogleSearch";
import { useEffect } from "react";
import { toast } from "sonner";
import { ProfilesList } from "@/components/profile/ProfileCard";
import { DisplayModeToggle } from "./components/DisplayModeToggle";
import { SearchLoadingState } from "./components/SearchLoadingState";
import { SearchErrorState } from "./components/SearchErrorState";
import { EmptySearchState } from "./components/EmptySearchState";
import { LoadMoreButton } from "./components/LoadMoreButton";
import { useSearchDisplay } from "./hooks/useSearchDisplay";
import { useSearchInitiation } from "./hooks/useSearchInitiation";

// Define the props interface correctly
interface GoogleSearchWindowProps {
  searchTerm?: string;
  initialSearchString?: string; // Renamed from searchString to avoid conflict with hook state
  searchType?: 'candidates' | 'candidates-at-company' | 'companies';
  jobId?: number | null;
}

// Define the functional component correctly and export it
export const GoogleSearchWindow = ({
  searchTerm,
  initialSearchString,
  searchType = "candidates", // Apply default value during destructuring
  jobId
}: GoogleSearchWindowProps) => {
  console.log("🔍 [CRITICAL] GoogleSearchWindow rendered with props:", {
    searchTerm,
    initialSearchString, // Use the destructured prop name
    searchType,
    jobId
  });

  // Get search functionality from custom hook
  // Destructure the hook's return values
  const {
    results,
    isLoading,
    searchString, // This is the state variable from the hook
    setSearchString,
    handleSearch,
    handleLoadMore,
    handleCopySearchString,
    handleExport,
    totalResults,
    currentPage,
    error
    // Pass the correctly destructured props to the hook
  } = useGoogleSearch(initialSearchString || searchTerm || "", searchType, jobId ?? undefined); // Use nullish coalescing for jobId

  console.log("🔍 [CRITICAL] GoogleSearchWindow state after useGoogleSearch:", {
    resultsCount: results.length,
    isLoading,
    searchString,
    totalResults,
    currentPage,
    hasError: !!error
  });

  // Display mode management
  const { showResultsAs, toggleDisplayMode, formattedProfiles } = useSearchDisplay(
    results,
    initialSearchString, // Use the destructured prop name
    searchTerm,
    setSearchString
  );

  // Auto-search initiation
  useSearchInitiation(
    searchString, // Use the state variable from the hook
    initialSearchString, // Use the prop
    searchTerm, // Use the prop
    results,
    isLoading,
    handleSearch
  );

  // Show error messages
  useEffect(() => {
    if (error) {
      console.error("❌ [ERROR] Search error occurred:", error);
      // Check if error is an instance of Error before accessing message
      toast.error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [error]);

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
      <div className="space-y-4">
        {/* Render SearchHeader */}
        <SearchHeader
          searchString={searchString} // Pass the state variable from the hook
          setSearchString={setSearchString}
          handleSearch={() => handleSearch(1)}
          handleExport={handleExport}
          handleCopySearchString={handleCopySearchString}
          isLoading={isLoading}
          resultsExist={results.length > 0}
        />

        {/* Display loading state */}
        {isLoading && results.length === 0 && <SearchLoadingState />}

        {/* Display error state */}
        {error && !isLoading && results.length === 0 && (
          <SearchErrorState error={error} onRetry={() => handleSearch(1)} />
        )}

        {/* Display empty state when no results and not loading */}
        {!isLoading && results.length === 0 && !error && <EmptySearchState />}

        {/* Search results section with toggle */}
        {results.length > 0 && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-500">
                Found {totalResults.toLocaleString()} results
              </div>
              <DisplayModeToggle currentMode={showResultsAs} onToggle={toggleDisplayMode} />
            </div>

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
                searchType={searchType} // Pass the destructured prop
              />
            )}

            {/* Load more button */}
            {totalResults > results.length && (
              <LoadMoreButton
                onClick={handleLoadMore}
                isLoading={isLoading && currentPage > 1}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
