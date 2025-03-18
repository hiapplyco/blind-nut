
import { useCallback } from "react";
import { toast } from "sonner";
import { SearchType } from "../../types";
import { fetchSearchResults, processSearchResults } from "./searchApi";
import { prepareSearchString, exportResultsToCSV } from "./utils";

/**
 * Hook for search-related actions (search, load more, etc.)
 */
export const useSearchActions = (
  searchString: string,
  setState: (updater: (prev: any) => any) => void,
  results: any[],
  saveResults: (results: any[], searchQuery: string, totalResults: number) => void,
  appendResults: (results: any[]) => void,
  currentPage: number,
  searchType: SearchType,
  jobId?: number,
  resultsPerPage: number = 10
) => {
  // Search handling function
  const handleSearch = useCallback(async (page = 1) => {
    if (!searchString.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    // Reset error state before new search
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log("🔍 [CRITICAL] Executing search with query:", searchString);
      if (page === 1) {
        setState(prev => ({ ...prev, results: [] }));
      }
      
      // Ensure the search string includes the site restriction
      const searchWithSite = prepareSearchString(searchString, searchType);
      console.log("🔍 [CRITICAL] Search string with site constraint:", searchWithSite);
      
      const { data, error } = await fetchSearchResults(
        searchWithSite, 
        page, 
        searchType, 
        resultsPerPage
      );
      
      if (error) {
        console.error("❌ [ERROR] Search API error:", error);
        setState(prev => ({ ...prev, isLoading: false, error }));
        toast.error(`Search failed: ${error.message}`);
        return;
      }
      
      if (data?.items) {
        const processedResults = processSearchResults(data);
        console.log("✅ [SUCCESS] Received search results:", processedResults.length);
        
        // Convert string totalResults to number
        const numTotalResults = Number(data.searchInformation?.totalResults) || 0;
        
        if (page === 1) {
          setState(prev => ({ 
            ...prev, 
            results: processedResults,
            currentPage: page,
            totalResults: numTotalResults,
            isLoading: false
          }));
          
          if (jobId) {
            saveResults(
              processedResults, 
              searchWithSite, // Save the full search string with site constraint
              numTotalResults
            );
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            results: [...prev.results, ...processedResults],
            currentPage: page,
            totalResults: numTotalResults,
            isLoading: false
          }));
          
          if (jobId) {
            appendResults(processedResults);
          }
        }
        
        if (processedResults.length > 0) {
          toast.success(`${processedResults.length} profiles found`);
        } else {
          toast.info("No profiles found matching your criteria");
        }
      } else {
        console.log("ℹ️ [INFO] No results returned from search");
        setState(prev => ({ ...prev, isLoading: false }));
        toast.info("No results found");
      }
    } catch (error) {
      console.error("❌ [ERROR] Error fetching search results:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error("Failed to fetch search results") 
      }));
      toast.error("Failed to fetch search results. Please try again.");
    }
  }, [searchString, jobId, saveResults, appendResults, searchType, resultsPerPage, setState]);

  // Load more results
  const handleLoadMore = useCallback(() => {
    handleSearch(currentPage + 1);
  }, [currentPage, handleSearch]);

  // Copy search string to clipboard
  const handleCopySearchString = useCallback(() => {
    // Add site:linkedin.com/in/ when copying if not already present
    const finalSearchString = prepareSearchString(searchString, searchType);
    
    navigator.clipboard.writeText(finalSearchString);
    toast.success('Search string copied to clipboard');
  }, [searchString, searchType]);

  // Export results to CSV
  const handleExport = useCallback(() => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }
    
    try {
      exportResultsToCSV(results);
      toast.success("Results exported to CSV");
    } catch (err) {
      console.error("Error exporting results:", err);
      toast.error("Failed to export results");
    }
  }, [results]);

  // Set search string function
  const setSearchString = useCallback((value: React.SetStateAction<string>) => {
    setState(prev => ({ 
      ...prev, 
      searchString: typeof value === "function" ? value(prev.searchString) : value,
      error: null // Reset error when search string changes
    }));
  }, [setState]);

  return {
    handleSearch,
    handleLoadMore,
    handleCopySearchString,
    handleExport,
    setSearchString,
  };
};
