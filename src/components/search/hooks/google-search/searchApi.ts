
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchResult } from "../../types";
import { extractLocationFromSnippet, prepareSearchString } from "./utils";
import { GoogleSearchResult } from "./types";

/**
 * Fetches search results from Google Custom Search Engine
 */
export const fetchSearchResults = async (
  searchString: string,
  page: number,
  searchType: string,
  resultsPerPage: number
): Promise<{ data: GoogleSearchResult | null; error: Error | null }> => {
  try {
    const startIndex = (page - 1) * resultsPerPage + 1;
    
    console.log(`Fetching search results for: "${searchString}" (page ${page})`);
    
    // First try to use the process-search-results edge function which provides enriched results
    try {
      console.log("Attempting to use process-search-results for enriched results");
      const processResponse = await supabase.functions.invoke('process-search-results', {
        body: { searchString }
      });
      
      if (processResponse.data && processResponse.data.profiles) {
        console.log("Successfully received enriched profiles:", processResponse.data.profiles.length);
        // Transform profiles into Google search result format
        return { 
          data: {
            items: processResponse.data.profiles.map((profile: any) => ({
              title: profile.profile_name,
              link: profile.profile_url,
              snippet: `${profile.profile_title} | ${profile.profile_location}`,
              htmlTitle: profile.profile_name,
              profileUrl: profile.profile_url,
              name: profile.profile_name,
              location: profile.profile_location,
              jobTitle: profile.profile_title, // Changed from 'title' to avoid duplication
              enriched: profile.enriched || false,
              work_email: profile.work_email,
              phone_numbers: profile.phone_numbers,
              relevance_score: profile.relevance_score
            })),
            searchInformation: {
              totalResults: processResponse.data.profiles.length
            }
          }, 
          error: null 
        };
      }
    } catch (enrichError) {
      console.log("Failed to get enriched profiles, falling back to CSE:", enrichError);
      // Fall back to regular Google CSE if enriched profiles fail
    }
    
    // Fall back to Google CSE for regular search results
    const { data: { key }, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
    
    if (keyError) {
      console.error("Error fetching CSE key:", keyError);
      throw keyError;
    }
    
    // Add site:linkedin.com/in/ automatically if it's a candidate search and doesn't already have it
    const finalSearchString = prepareSearchString(searchString, searchType);
    
    console.log("Final search string being used:", finalSearchString);
    
    const cseId = 'b28705633bcb44cf0'; // Candidates CSE
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cseId}&q=${encodeURIComponent(
        finalSearchString
      )}&start=${startIndex}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Search API response:", data);
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Processes Google search results into a standardized format
 */
export const processSearchResults = (data: GoogleSearchResult): SearchResult[] => {
  if (!data?.items) return [];
  
  return data.items.map((item: any) => ({
    ...item,
    location: item.location || extractLocationFromSnippet(item.snippet)
  }));
};
