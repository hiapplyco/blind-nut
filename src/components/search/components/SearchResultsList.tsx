
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchResultItem } from "./SearchResultItem";
import { SearchResultsListProps } from "../types";

export const SearchResultsList = ({
  results,
  isLoading,
  totalResults,
  currentResults,
  onLoadMore,
  isLoadingMore,
  searchType
}: SearchResultsListProps) => {
  return (
    <div className="space-y-4">
      {results.length === 0 && !isLoading && (
        <div className="flex items-center justify-center p-4 text-gray-500">
          <AlertCircle className="w-4 h-4 mr-2" />
          No results yet. Click search to find matches.
        </div>
      )}
      
      {results.map((result, index) => (
        <SearchResultItem 
          key={index} 
          result={result} 
          searchType={searchType} 
        />
      ))}
      
      {results.length > 0 && Number(totalResults) > currentResults && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onLoadMore} 
            disabled={isLoadingMore}
            variant="outline"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>Load More Results</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
