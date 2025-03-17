
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult, SearchType } from "../types";
import { toast } from "sonner";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

export const useGoogleSearch = (
  initialSearchString: string,
  searchType: SearchType = "candidates",
  jobId?: number
) => {
  const { setSearchResults, getSearchResults, addToSearchResults } = useClientAgentOutputs();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchString, setSearchString] = useState(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  // Initialize from jobId if available
  useEffect(() => {
    if (jobId) {
      const storedData = getSearchResults(jobId);
      if (storedData) {
        console.log("Loading stored data for jobId:", jobId, storedData);
        setResults(storedData.results);
        setSearchString(storedData.searchQuery);
        setTotalResults(storedData.totalResults);
        const calculatedPage = Math.ceil(storedData.results.length / resultsPerPage);
        setCurrentPage(calculatedPage > 0 ? calculatedPage : 1);
      } else {
        console.log("No stored data found for jobId:", jobId, "initializing with:", initialSearchString);
        setSearchString(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
        setResults([]);
        setCurrentPage(1);
        setTotalResults(0);
      }
    }
  }, [jobId, initialSearchString, getSearchResults]);

  // Update when initialSearchString changes
  useEffect(() => {
    if (initialSearchString && initialSearchString !== searchString) {
      console.log("Updating search string from initialSearchString:", initialSearchString);
      const cleanedSearchString = initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, '');
      setSearchString(cleanedSearchString);
      
      // Reset results when search string changes
      if (searchString && searchString !== cleanedSearchString) {
        setResults([]);
        setCurrentPage(1);
        setTotalResults(0);
        
        if (jobId) {
          setSearchResults(jobId, [], cleanedSearchString, 0);
        }
      }
    }
  }, [initialSearchString, setSearchResults, jobId]);

  // Save results to store when they change
  useEffect(() => {
    if (jobId && results.length > 0) {
      console.log("Saving search results to store for jobId:", jobId);
      setSearchResults(jobId, results, searchString, totalResults);
    }
  }, [jobId, results, searchString, totalResults, setSearchResults]);

  const extractLocationFromSnippet = (snippet: string): string | undefined => {
    const locationPatterns = [
      /Location: ([^\.]+)/i,
      /([^\.]+), (United States|Canada|UK|Australia|[A-Z][a-z]+ [A-Z][a-z]+)/,
      /(.*) Area/
    ];
    
    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  };

  const handleSearch = useCallback(async (page = 1) => {
    if (!searchString.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    try {
      if (page === 1) {
        setResults([]);
      }
      
      const startIndex = (page - 1) * resultsPerPage + 1;
      
      console.log(`Fetching search results for: "${searchString}" (page ${page})`);
      
      const { data: { key }, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
      
      if (keyError) {
        console.error("Error fetching CSE key:", keyError);
        throw keyError;
      }
      
      const cseId = 'b28705633bcb44cf0'; // Candidates CSE
      
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cseId}&q=${encodeURIComponent(
          searchString
        )}&start=${startIndex}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Search API response:", data);

      if (data?.items) {
        const processedResults = data.items.map((item: any) => ({
          ...item,
          location: extractLocationFromSnippet(item.snippet)
        }));
        
        if (page === 1) {
          setResults(processedResults);
          if (jobId) {
            setSearchResults(jobId, processedResults, searchString, data.searchInformation?.totalResults || 0);
          }
        } else {
          setResults(prev => [...prev, ...processedResults]);
          if (jobId) {
            addToSearchResults(jobId, processedResults);
          }
        }
        
        setCurrentPage(page);
        setTotalResults(data.searchInformation?.totalResults || 0);
        toast.success("Search results loaded successfully");
      } else {
        toast.error("No results found");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast.error("Failed to fetch search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchString, jobId, setSearchResults, addToSearchResults, resultsPerPage]);

  const handleLoadMore = useCallback(() => {
    handleSearch(currentPage + 1);
  }, [currentPage, handleSearch]);

  const handleCopySearchString = useCallback(() => {
    navigator.clipboard.writeText(searchString);
    toast.success('Search string copied to clipboard');
  }, [searchString]);

  const handleExport = useCallback(() => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }

    const csvContent = [
      ["Title", "URL", "Location", "Description"],
      ...results.map(result => [
        result.title.replace(/"/g, '""'),
        result.link,
        result.location || "",
        result.snippet.replace(/"/g, '""')
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `search-results-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Search results exported successfully");
  }, [results]);

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
