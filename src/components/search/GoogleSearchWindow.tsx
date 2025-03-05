import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, AlertCircle, Copy, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

interface GoogleSearchWindowProps {
  searchString: string;
  searchType?: "candidates" | "companies" | "candidates-at-company";
  jobId?: number;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle: string;
  location?: string;
}

export const GoogleSearchWindow = ({ 
  searchString: initialSearchString,
  searchType = "candidates",
  jobId
}: GoogleSearchWindowProps) => {
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

  const handleEnrichProfile = async (profileUrl: string) => {
    try {
      toast.loading("Fetching contact information...");
      
      const response = await fetch('https://kxghaajojntkqrmvsngn.supabase.co/functions/v1/enrich-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to enrich profile');
      }
      
      const data = await response.json();
      
      toast.dismiss();
      
      if (data.data) {
        toast.success("Contact information found!");
        if (data.data.work_email) {
          toast.success(`Email: ${data.data.work_email}`);
        }
        if (data.data.mobile_phone) {
          toast.success(`Phone: ${data.data.mobile_phone}`);
        }
      } else {
        toast.error("No contact information found");
      }
    } catch (err) {
      console.error('Error enriching profile:', err);
      toast.error("Could not retrieve contact information");
    }
  };

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Google Search Results</h2>
          <div className="space-x-2">
            <Button
              onClick={() => handleSearch(1)}
              disabled={isLoading}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button
              onClick={handleExport}
              disabled={results.length === 0}
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm text-gray-600">Search String:</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySearchString}
              className="hover:bg-gray-200"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="mt-2 font-mono text-sm resize-none focus:ring-2 focus:ring-black"
            rows={4}
          />
        </div>

        <div className="space-y-4">
          {results.length === 0 && !isLoading && (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              No results yet. Click search to find matches.
            </div>
          )}
          {results.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg border-black relative">
              <h3 className="font-medium">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  dangerouslySetInnerHTML={{ __html: result.htmlTitle }}
                />
              </h3>
              {result.location && (
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  📍 {result.location}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-600">{result.snippet}</p>
              
              {searchType !== 'companies' && result.link.includes('linkedin.com/in/') && (
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={() => handleEnrichProfile(result.link)}
                    size="sm"
                    variant="secondary"
                    className="border-2 border-black bg-[#FEF7CD] hover:bg-[#FEF7CD]/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] z-10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Get Contact Info
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {results.length > 0 && Number(totalResults) > results.length && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoading}
                variant="outline"
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <>Load More Results</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
