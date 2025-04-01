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
// Removed imports from stashed changes as they are not used in the upstream structure:
// import { supabase } from "@/integrations/supabase/client";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";

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
  console.log("🔍 [CRITICAL] GoogleSearchWindow rendered with props:", {
    searchTerm,
    initialSearchString,
    searchType,
    jobId
  });

  // Get search functionality from custom hook (Upstream version)
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

  console.log("🔍 [CRITICAL] GoogleSearchWindow state after useGoogleSearch:", {
    resultsCount: results.length,
    isLoading,
    searchString,
    totalResults,
    currentPage,
    hasError: !!error
  });

  // Display mode management (Upstream version)
  const { showResultsAs, toggleDisplayMode, formattedProfiles } = useSearchDisplay(
    results,
    initialSearchString,
    searchTerm,
    setSearchString
  );

  // Auto-search initiation (Upstream version)
  useSearchInitiation(
    searchString,
    initialSearchString,
    searchTerm,
    results,
    isLoading,
    handleSearch
  );

  // Show error messages (Upstream version)
  useEffect(() => {
    if (error) {
      console.error("❌ [ERROR] Search error occurred:", error);
      toast.error(`Search failed: ${error.message || "Unknown error"}`);
    }
  }, [error]);

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
      <div className="space-y-4">
        {/* Render SearchHeader (Upstream version) */}
        <SearchHeader
          searchString={searchString}
          setSearchString={setSearchString}
          handleSearch={() => handleSearch(1)}
          handleExport={handleExport}
          handleCopySearchString={handleCopySearchString}
          isLoading={isLoading}
          resultsExist={results.length > 0}
        />

        {/* Display loading state (Upstream version) */}
        {isLoading && results.length === 0 && <SearchLoadingState />}

        {/* Display error state (Upstream version) */}
        {error && !isLoading && results.length === 0 && (
          <SearchErrorState error={error} onRetry={() => handleSearch(1)} />
        )}

        {/* Display empty state when no results and not loading (Upstream version) */}
        {!isLoading && results.length === 0 && !error && <EmptySearchState />}

        {/* Search results section with toggle (Upstream version) */}
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
                searchType={searchType}
              />
            )}

            {/* Load more button (Upstream version) */}
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
