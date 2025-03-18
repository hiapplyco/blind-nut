
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
    location: extractLocationFromSnippet(item.snippet)
  }));
};
