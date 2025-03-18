
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
    console.log(`Search type: ${searchType}, resultsPerPage: ${resultsPerPage}`);
    
    // Get the CSE API key from Supabase Edge Function
    console.log("Retrieving Google CSE API key from Supabase Edge Function");
    const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
    
    if (keyError) {
      console.error("Error fetching CSE key:", keyError);
      toast.error(`Failed to get Google CSE API key: ${keyError.message}`);
      throw keyError;
    }
    
    if (!keyData || !keyData.key) {
      console.error("No CSE key returned from function:", keyData);
      toast.error("Failed to get Google CSE API key");
      throw new Error("Failed to get Google CSE API key");
    }
    
    console.log("Successfully retrieved CSE key, preparing search request");
    
    // Add site:linkedin.com/in/ automatically if it's a candidate search and doesn't already have it
    const finalSearchString = prepareSearchString(searchString, searchType);
    
    console.log("Final search string being used:", finalSearchString);
    
    // Use appropriate CSE ID based on search type
    const cseId = 'b28705633bcb44cf0'; // Candidates CSE
    
    // Make request to Google CSE API
    const cseUrl = `https://www.googleapis.com/customsearch/v1?key=${keyData.key}&cx=${cseId}&q=${encodeURIComponent(
      finalSearchString
    )}&start=${startIndex}`;
    
    console.log("Making CSE request to:", cseUrl.replace(keyData.key, "REDACTED_KEY"));
    
    const response = await fetch(cseUrl);
    
    // Log the response status and headers for debugging
    console.log("CSE API response status:", response.status);
    console.log("CSE API response headers:", Object.fromEntries([...response.headers.entries()]));
    
    // Get the raw response text
    const responseText = await response.text();
    console.log("CSE API response length:", responseText.length);
    console.log("CSE API response preview:", responseText.substring(0, 200) + "...");
    
    if (!response.ok) {
      console.error("CSE API response not OK:", response.status, responseText);
      toast.error(`Google CSE API error: ${response.status}`);
      throw new Error(`Google CSE API error: ${response.status} - ${responseText}`);
    }
    
    try {
      const responseData = JSON.parse(responseText);
      console.log("Parsed search API response - items count:", responseData.items?.length || 0);
      console.log("Total results reported:", responseData.searchInformation?.totalResults || 0);
      
      // Check if we have search results and transform them into the correct format
      if (responseData && responseData.items && responseData.items.length > 0) {
        return { 
          data: {
            items: responseData.items.map((item: any) => ({
              ...item,
              name: item.title.replace(/\s\|\s.*$/, ''), // Extract name from title
              location: extractLocationFromSnippet(item.snippet),
              jobTitle: item.snippet.split('|')[0].trim(),
              profileUrl: item.link,
              relevance_score: 75 // Default score for CSE results
            })),
            searchInformation: responseData.searchInformation
          }, 
          error: null 
        };
      } else {
        console.log("No items in search results:", responseData);
        // Return empty results instead of throwing an error
        return { 
          data: {
            items: [],
            searchInformation: {
              totalResults: "0"  // This matches the type now
            }
          }, 
          error: null 
        };
      }
    } catch (parseError) {
      console.error("Error parsing CSE API response:", parseError);
      toast.error(`Failed to parse search results: ${parseError.message}`);
      throw new Error(`Failed to parse CSE API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    toast.error("Failed to fetch search results. Please try again.");
    return { data: null, error: error as Error };
  }
};

/**
 * Processes Google search results into a standardized format
 */
export const processSearchResults = (data: GoogleSearchResult): SearchResult[] => {
  if (!data?.items) {
    console.log("No items in search results data:", data);
    return [];
  }
  
  console.log("Processing search results:", data.items.length);
  
  return data.items.map((item: any) => {
    // Ensure all required fields are present and properly formatted
    const result: SearchResult = {
      title: item.title || "",
      link: item.link || item.profileUrl || "",
      snippet: item.snippet || "",
      name: item.name || item.title || "",
      location: item.location || extractLocationFromSnippet(item.snippet) || "",
      relevance_score: item.relevance_score || 75,
      jobTitle: item.jobTitle || (item.snippet ? item.snippet.split('|')[0].trim() : ""),
      profileUrl: item.profileUrl || item.link || ""
    };
    
    return result;
  });
};
