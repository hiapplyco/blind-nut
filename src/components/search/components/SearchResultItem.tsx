
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { SearchResultItemProps } from "../types";
import { useProfileEnrichment } from "../hooks/useProfileEnrichment";

export const SearchResultItem = ({ 
  result, 
  searchType 
}: SearchResultItemProps) => {
  const { enrichProfile } = useProfileEnrichment();

  return (
    <div className="p-4 border rounded-lg border-black relative">
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
            onClick={() => enrichProfile(result.link)}
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
  );
};
