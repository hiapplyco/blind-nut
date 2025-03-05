
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
      
      const { data, error } = await supabase.functions.invoke('enrich-profile', {
        body: {
          profileUrl
        }
      });
      
      toast.dismiss();
      
      if (error) {
        throw new Error(`Failed to enrich profile: ${error.message}`);
      }
      
      if (data?.data) {
        setEnrichedData(data.data);
        return data.data;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error enriching profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not retrieve contact information';
      setError(errorMessage);
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
      
      const { data, error } = await supabase.functions.invoke('enrich-profile', {
        body: {
          searchParams: params
        }
      });
      
      toast.dismiss();
      
      if (error) {
        throw new Error(`Failed to search for contacts: ${error.message}`);
      }
      
      if (data?.data && data.data.length > 0) {
        setSearchResults(data.data);
        setTotalResults(data.total || data.data.length);
        return data.data;
      } else {
        toast.error("No contacts found matching your search criteria");
        return [];
      }
    } catch (err) {
      console.error('Error searching for contacts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not search for contacts';
      setError(errorMessage);
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
