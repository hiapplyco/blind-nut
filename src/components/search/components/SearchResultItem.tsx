
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { SearchResultItemProps } from "../types";
import { useProfileEnrichment } from "../hooks/useProfileEnrichment";

export const SearchResultItem = ({ 
  result, 
  searchType 
}: SearchResultItemProps) => {
  const { enrichProfile } = useProfileEnrichment();
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract name from the title for better search results
  const extractNameFromTitle = (title: string): string => {
    // Remove HTML tags
    const withoutTags = title.replace(/<\/?[^>]+(>|$)/g, "");
    // Try to get just the name before any symbols like |, -, at, etc.
    const namePart = withoutTags.split(/[|\-–—@]/).map(s => s.trim())[0];
    return namePart || withoutTags;
  };

  const handleGetContactInfo = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const data = await enrichProfile(result.link);
      if (data) {
        toast.success("Contact information found!");
        if (data.work_email) {
          toast.success(`Email: ${data.work_email}`);
        }
        if (data.mobile_phone) {
          toast.success(`Phone: ${data.mobile_phone}`);
        }
      } else {
        toast.error("No contact information found");
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast.error("Could not retrieve contact information");
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={handleGetContactInfo}
            size="sm"
            variant="secondary"
            disabled={isLoading}
            className="border-2 border-black bg-[#FEF7CD] hover:bg-[#FEF7CD]/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] z-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Get Contact Info
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
