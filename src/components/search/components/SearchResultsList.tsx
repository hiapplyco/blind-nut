
import { AlertCircle, Loader2, Search } from "lucide-react";
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
      {isLoading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Loader2 className="w-10 h-10 mb-4 animate-spin text-purple-500" />
          <p className="text-lg">Searching for results...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      )}
      
      {results.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="w-10 h-10 mb-4 text-amber-500" />
          <p className="text-lg font-medium mb-2">No results found</p>
          <p className="text-sm text-center text-gray-500 mb-4">
            Try adjusting your search terms or click the Search button to try again.
          </p>
          <Button 
            onClick={() => onLoadMore()} 
            variant="outline"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Try Search Again
          </Button>
        </div>
      )}
      
      {results.map((result, index) => (
        <SearchResultItem 
          key={`${result.link}-${index}`} 
          result={result} 
          searchType={searchType} 
        />
      ))}
      
      {results.length > 0 && totalResults && Number(totalResults) > (currentResults || results.length) && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onLoadMore} 
            disabled={isLoadingMore}
            variant="outline"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more results...
              </>
            ) : (
              <>Load More Results</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
