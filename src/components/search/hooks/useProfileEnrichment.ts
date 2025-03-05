import { useState } from 'react';
import { toast } from "sonner";
import { EnrichedProfileData } from "../types";

export interface PersonSearchParams {
  name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  industry?: string;
  location?: string;
  country?: string;
  filter?: string;
  require?: string;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  data: EnrichedProfileData;
  metadata?: any;
  status: number;
}

interface SearchResponse {
  data: SearchResult[];
  status: number;
  total: number;
}

export const useProfileEnrichment = () => {
  const [enrichedData, setEnrichedData] = useState<EnrichedProfileData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const enrichProfile = async (profileUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
        throw new Error(`Failed to enrich profile: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast.dismiss();
      
      if (data.data) {
        setEnrichedData(data.data);
        toast.success("Contact information found!");
        if (data.data.work_email) {
          toast.success(`Email: ${data.data.work_email}`);
        }
        if (data.data.mobile_phone) {
          toast.success(`Phone: ${data.data.mobile_phone}`);
        }
        return data.data;
      } else {
        toast.error("No contact information found");
        return null;
      }
    } catch (err) {
      console.error('Error enriching profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not retrieve contact information';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchPerson = async (params: PersonSearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchResults([]);
      
      toast.loading("Searching for contact information...");
      
      const response = await fetch('https://kxghaajojntkqrmvsngn.supabase.co/functions/v1/enrich-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchParams: params
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search for contacts: ${response.status}`);
      }
      
      const data = await response.json() as SearchResponse;
      
      toast.dismiss();
      
      if (data.data && data.data.length > 0) {
        setSearchResults(data.data);
        setTotalResults(data.total || data.data.length);
        toast.success(`Found ${data.total || data.data.length} contacts`);
        return data.data;
      } else {
        toast.error("No contacts found matching your search criteria");
        return [];
      }
    } catch (err) {
      console.error('Error searching for contacts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not search for contacts';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    enrichProfile, 
    searchPerson, 
    enrichedData, 
    searchResults, 
    isLoading, 
    error,
    totalResults
  };
};
