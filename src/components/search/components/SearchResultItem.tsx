
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SearchResultItemProps } from "../types";
import { useProfileEnrichment } from "../hooks/useProfileEnrichment";
import { ContactCard } from "./contact-card";

export const SearchResultItem = ({ 
  result, 
  searchType 
}: SearchResultItemProps) => {
  console.log("🔍 [DEBUG] SearchResultItem rendering with:", {
    name: result.name || result.title,
    link: result.link || result.profileUrl,
    hasLocation: !!result.location
  });

  const { enrichProfile } = useProfileEnrichment();
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [showContactCard, setShowContactCard] = useState(false);
  
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
    setError(null);
    setShowContactCard(true);
    
    try {
      const data = await enrichProfile(result.link || result.profileUrl || '');
      if (data) {
        setEnrichedData(data);
        toast.success("Contact information found!");
      } else {
        setError("No contact information found");
        toast.error("No contact information found");
      }
    } catch (error) {
      console.error("Error enriching profile:", error);
      setError("Could not retrieve contact information");
      toast.error("Could not retrieve contact information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg border-black relative hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-[#F5F0ED]">
      <h3 className="font-medium">
        <a
          href={result.link || result.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          dangerouslySetInnerHTML={{ __html: result.htmlTitle || result.name }}
        />
      </h3>
      {result.location && (
        <p className="mt-1 text-sm font-semibold text-emerald-600 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {result.location}
        </p>
      )}
      <p className="mt-1 text-sm text-gray-600">{result.snippet || result.title}</p>
      
      {(result.link?.includes('linkedin.com/in/') || result.profileUrl?.includes('linkedin.com/in/')) && (
        <div className="mt-2 flex justify-end">
          <Button
            onClick={handleGetContactInfo}
            size="sm"
            variant="secondary"
            disabled={isLoading}
            className="border-2 border-black bg-[#FEF7CD] hover:bg-[#FEF7CD]/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] z-10 animate-fade-in"
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

      <ContactCard 
        isOpen={showContactCard}
        onClose={() => setShowContactCard(false)}
        profileData={enrichedData}
        isLoading={isLoading}
        error={error}
        profileName={extractNameFromTitle(result.htmlTitle || result.name)}
      />
    </div>
  );
};
