
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { SearchResult, SearchType } from "../types";
import { fetchSearchResults, processSearchResults } from "./google-search/searchApi";
import { useStoredResults } from "./google-search/useStoredResults";
import { cleanSearchString, prepareSearchString, exportResultsToCSV } from "./google-search/utils";
import { GoogleSearchState } from "./google-search/types";

export const useGoogleSearch = (
  initialSearchString: string,
  searchType: SearchType = "candidates",
  jobId?: number
) => {
  const resultsPerPage = 10;
  
  // State management
  const [state, setState] = useState<GoogleSearchState>({
    results: [],
    isLoading: false,
    searchString: '',
    currentPage: 1,
    totalResults: 0
  });

  const { results, isLoading, searchString, currentPage, totalResults } = state;
  
  // Storage management for job results
  const { getStoredResults, saveResults, appendResults } = useStoredResults(jobId);

  // Set initial search string
  useEffect(() => {
    if (initialSearchString && initialSearchString.trim() !== '') {
      // Remove site:linkedin.com/in/ from the displayed search string
      const cleanedString = cleanSearchString(initialSearchString);
      setState(prev => ({ ...prev, searchString: cleanedString }));
      console.log("Initial search string set to:", cleanedString);
    }
  }, [initialSearchString]);

  // Initialize from jobId if available
  useEffect(() => {
    if (jobId) {
      const storedData = getStoredResults();
      if (storedData) {
        setState(prev => ({
          ...prev,
          results: storedData.results,
          searchString: storedData.searchQuery ? cleanSearchString(storedData.searchQuery) : prev.searchString,
          totalResults: storedData.totalResults,
          currentPage: Math.ceil(storedData.results.length / resultsPerPage) || 1
        }));
      }
    }
  }, [jobId, getStoredResults, resultsPerPage]);

  // Update when initialSearchString changes
  useEffect(() => {
    if (initialSearchString && initialSearchString.trim() !== '') {
      console.log("Updating search string from initialSearchString:", initialSearchString);
      const cleanedSearchString = cleanSearchString(initialSearchString);
      
      if (searchString !== cleanedSearchString) {
        setState(prev => ({
          ...prev,
          searchString: cleanedSearchString,
          results: [],
          currentPage: 1,
          totalResults: 0
        }));
        
        if (jobId) {
          saveResults([], cleanedSearchString, 0);
        }
      }
    }
  }, [initialSearchString, saveResults, jobId, searchString]);

  // Save results to store when they change
  useEffect(() => {
    if (jobId && results.length > 0) {
      console.log("Saving search results to store for jobId:", jobId);
      saveResults(results, searchString, totalResults);
    }
  }, [jobId, results, searchString, totalResults, saveResults]);

  // Search handling function
  const handleSearch = useCallback(async (page = 1) => {
    if (!searchString.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("Executing search with query:", searchString);
      if (page === 1) {
        setState(prev => ({ ...prev, results: [] }));
      }
      
      const { data, error } = await fetchSearchResults(
        searchString, 
        page, 
        searchType, 
        resultsPerPage
      );
      
      if (error) throw error;
      
      if (data?.items) {
        const processedResults = processSearchResults(data);
        console.log("Received search results:", processedResults.length);
        
        if (page === 1) {
          setState(prev => ({ 
            ...prev, 
            results: processedResults,
            currentPage: page,
            totalResults: data.searchInformation?.totalResults || 0
          }));
          
          if (jobId) {
            saveResults(
              processedResults, 
              searchString, 
              data.searchInformation?.totalResults || 0
            );
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            results: [...prev.results, ...processedResults],
            currentPage: page,
            totalResults: data.searchInformation?.totalResults || 0
          }));
          
          if (jobId) {
            appendResults(processedResults);
          }
        }
        
        toast.success("Search results loaded successfully");
      } else {
        console.log("No results returned from search");
        toast.error("No results found");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast.error("Failed to fetch search results. Please try again.");
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [searchString, jobId, saveResults, appendResults, searchType, resultsPerPage]);

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
    exportResultsToCSV(results);
  }, [results]);

  // Set search string function
  const setSearchString = useCallback((value: React.SetStateAction<string>) => {
    setState(prev => ({ 
      ...prev, 
      searchString: typeof value === "function" ? value(prev.searchString) : value 
    }));
  }, []);

  return { 
    results, 
    isLoading, 
    searchString, 
    setSearchString, 
    handleSearch, 
    handleLoadMore, 
    handleCopySearchString, 
    handleExport,
    currentPage,
    totalResults
  };
};
