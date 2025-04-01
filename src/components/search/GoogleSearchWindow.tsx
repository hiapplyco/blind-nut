import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // Import cn utility

interface GoogleSearchWindowProps {
  searchString: string;
  searchType?: "candidates" | "companies" | "candidates-at-company";
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle: string;
}

export const GoogleSearchWindow = ({ 
  searchString: initialSearchString,
  searchType = "candidates" 
}: GoogleSearchWindowProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchString, setSearchString] = useState(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
  const [animateButton, setAnimateButton] = useState(false); // State for animation trigger

  // Clear results and trigger animation when search string changes
  useEffect(() => {
    setSearchString(initialSearchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, ''));
    setResults([]);
    if (initialSearchString) { // Only animate if there's a new string
      setAnimateButton(true);
      const timer = setTimeout(() => setAnimateButton(false), 1500); // Pulse for 1.5 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [initialSearchString]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const { data: { key }, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
      
      if (keyError) throw keyError;
      
      // Use candidates CSE for both candidates and candidates-at-company searches
      const cseId = searchType === 'companies' 
        ? 'e391b913931574878'  // Companies CSE
        : 'b28705633bcb44cf0'; // Candidates CSE
      
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cseId}&q=${encodeURIComponent(
          searchString
        )}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Search API response:", data);

      if (data?.items) {
        setResults(data.items);
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

  const handleCopySearchString = () => {
    navigator.clipboard.writeText(searchString);
    toast.success('Search string copied to clipboard');
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }

    // Create CSV content
    const csvContent = [
      ["Title", "URL", "Description"], // CSV header
      ...results.map(result => [
        result.title.replace(/"/g, '""'), // Escape quotes in title
        result.link,
        result.snippet.replace(/"/g, '""') // Escape quotes in snippet
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    // Create blob and download
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

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Google Search Results</h2>
          <div className="space-x-2">
            {/* Search button moved below Textarea */}
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

        {/* Search String Input and Actions */}
        <div className="p-4 bg-gray-100 rounded-lg border-2 border-black space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-gray-600">Generated Google Search String:</h3>
            <Button
              variant="ghost"
              size="icon" // Make copy button smaller
              onClick={handleCopySearchString}
              className="hover:bg-gray-200 rounded-full h-7 w-7" // Adjust size and rounding
              aria-label="Copy search string"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="font-mono text-sm resize-none focus:ring-2 focus:ring-black border-gray-300 rounded" // Added border and rounding
            rows={4}
            aria-label="Editable Google search string"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !searchString.trim()} // Disable if empty
            className={cn( // Use cn for conditional classes
              "w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center justify-center py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold",
              animateButton && "animate-pulse" // Apply pulse animation conditionally
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Run Google Search
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {results.length === 0 && !isLoading && (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              No results yet. Click search to find matches.
            </div>
          )}
          {results.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-medium">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  dangerouslySetInnerHTML={{ __html: result.htmlTitle }}
                />
              </h3>
              <p className="mt-1 text-sm text-gray-600">{result.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};