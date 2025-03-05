
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "../types";
import { toast } from "sonner";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

export const useGoogleSearch = (
  initialSearchString: string,
  searchType: "candidates" | "companies" | "candidates-at-company" = "candidates",
  jobId?: number
) => {
  const { setSearchResults, getSearchResults, addToSearchResults } = useClientAgentOutputs();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchString, setSearchString] = useState(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  useEffect(() => {
    if (jobId) {
      const storedData = getSearchResults(jobId);
      if (storedData) {
        setResults(storedData.results);
        setSearchString(storedData.searchQuery);
        setTotalResults(storedData.totalResults);
        const calculatedPage = Math.ceil(storedData.results.length / resultsPerPage);
        setCurrentPage(calculatedPage > 0 ? calculatedPage : 1);
      } else {
        setSearchString(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
        setResults([]);
        setCurrentPage(1);
        setTotalResults(0);
      }
    }
  }, [jobId, initialSearchString, getSearchResults]);

  // Updated to reset results when initialSearchString changes
  useEffect(() => {
    if (initialSearchString) {
      setSearchString(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
      setResults([]);
      setCurrentPage(1);
      setTotalResults(0);
      
      if (jobId) {
        setSearchResults(jobId, [], searchString, 0);
      }
    }
  }, [initialSearchString, setSearchResults, jobId]);

  useEffect(() => {
    if (jobId && results.length > 0) {
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

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    try {
      // Reset results if this is a new search (page 1)
      if (page === 1) {
        setResults([]);
      }
      
      const startIndex = (page - 1) * resultsPerPage + 1;
      
      const { data: { key }, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
      
      if (keyError) throw keyError;
      
      const cseId = searchType === 'companies' 
        ? 'e391b913931574878'  // Companies CSE
        : 'b28705633bcb44cf0'; // Candidates CSE
      
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
  };

  const handleLoadMore = () => {
    handleSearch(currentPage + 1);
  };

  const handleCopySearchString = () => {
    navigator.clipboard.writeText(searchString);
    toast.success('Search string copied to clipboard');
  };

  const handleExport = () => {
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
  };

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
