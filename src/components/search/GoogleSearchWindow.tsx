import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface GoogleSearchWindowProps {
  searchString: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle: string;
}

export const GoogleSearchWindow = ({ searchString }: GoogleSearchWindowProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=b28705633bcb44cf0&q=${encodeURIComponent(
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

  const handleExport = () => {
    // Future implementation for CSV/Excel export
    toast.info("Export functionality coming soon!");
  };

  return (
    <Card className="p-6 mb-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Google Search Results</h2>
          <div className="space-x-2">
            <Button
              onClick={handleSearch}
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
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
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