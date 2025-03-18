
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
    
    console.log(`🔍 [DEBUG] Fetching search results for: "${searchString}" (page ${page})`);
    console.log(`🔍 [DEBUG] Search type: ${searchType}, resultsPerPage: ${resultsPerPage}, startIndex: ${startIndex}`);
    
    // Get the CSE API key from Supabase Edge Function
    console.log("🔍 [DEBUG] Retrieving Google CSE API key from Supabase Edge Function");
    const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-cse-key');
    
    if (keyError) {
      console.error("❌ [ERROR] Error fetching CSE key:", keyError);
      console.error("❌ [ERROR] Error details:", JSON.stringify(keyError));
      toast.error(`Failed to get Google CSE API key: ${keyError.message}`);
      throw keyError;
    }
    
    if (!keyData || !keyData.key) {
      console.error("❌ [ERROR] No CSE key returned from function:", keyData);
      toast.error("Failed to get Google CSE API key");
      throw new Error("Failed to get Google CSE API key");
    }
    
    console.log("✅ [SUCCESS] CSE key received:", keyData.key ? "Key exists (length: " + keyData.key.length + ")" : "No key");
    console.log("✅ [SUCCESS] CSE key debug info:", keyData.debug);
    console.log("✅ [SUCCESS] Successfully retrieved CSE key, preparing search request");
    
    // Add site:linkedin.com/in/ automatically if it's a candidate search and doesn't already have it
    const finalSearchString = prepareSearchString(searchString, searchType);
    
    console.log("🔍 [DEBUG] Final search string being used:", finalSearchString);
    
    // Use appropriate CSE ID based on search type
    const cseId = 'b28705633bcb44cf0'; // Candidates CSE
    console.log("🔍 [DEBUG] Using CSE ID:", cseId);
    
    // Make request to Google CSE API
    const cseUrl = `https://www.googleapis.com/customsearch/v1?key=${keyData.key}&cx=${cseId}&q=${encodeURIComponent(
      finalSearchString
    )}&start=${startIndex}`;
    
    console.log("🔍 [DEBUG] Making CSE request to:", cseUrl.replace(keyData.key, "REDACTED_KEY"));
    
    const response = await fetch(cseUrl);
    
    // Log the response status and headers for debugging
    console.log("🔍 [DEBUG] CSE API response status:", response.status);
    console.log("🔍 [DEBUG] CSE API response headers:", Object.fromEntries([...response.headers.entries()]));
    
    // Get the raw response text
    const responseText = await response.text();
    console.log("🔍 [DEBUG] CSE API response length:", responseText.length);
    console.log("🔍 [DEBUG] CSE API response preview:", responseText.substring(0, 500) + "...");
    
    if (!response.ok) {
      console.error(`❌ [ERROR] CSE API response not OK: ${response.status}`, responseText.substring(0, 500));
      toast.error(`Google CSE API error: ${response.status}`);
      throw new Error(`Google CSE API error: ${response.status} - ${responseText.substring(0, 500)}`);
    }
    
    try {
      const responseData = JSON.parse(responseText);
      console.log("✅ [SUCCESS] Parsed search API response - items count:", responseData.items?.length || 0);
      console.log("🔍 [DEBUG] Total results reported:", responseData.searchInformation?.totalResults || 0);
      console.log("🔍 [DEBUG] Response data structure:", Object.keys(responseData).join(', '));
      
      // Check if we have search results and transform them into the correct format
      if (responseData && responseData.items && responseData.items.length > 0) {
        console.log("✅ [SUCCESS] Search returned results:", responseData.items.length);
        console.log("🔍 [DEBUG] First raw item sample:", JSON.stringify(responseData.items[0], null, 2));
        
        const transformedItems = responseData.items.map((item: any) => ({
          ...item,
          name: item.title.replace(/\s\|\s.*$/, ''), // Extract name from title
          location: extractLocationFromSnippet(item.snippet),
          jobTitle: item.snippet.split('|')[0].trim(),
          profileUrl: item.link,
          relevance_score: 75 // Default score for CSE results
        }));
        
        console.log("🔍 [DEBUG] First transformed item sample:", JSON.stringify(transformedItems[0], null, 2));
        
        return { 
          data: {
            items: transformedItems,
            searchInformation: responseData.searchInformation
          }, 
          error: null 
        };
      } else {
        console.log("ℹ️ [INFO] No items in search results:", responseData);
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
      console.error("❌ [ERROR] Error parsing CSE API response:", parseError);
      console.error("❌ [ERROR] Raw response causing parse error:", responseText.substring(0, 500));
      toast.error(`Failed to parse search results: ${parseError.message}`);
      throw new Error(`Failed to parse CSE API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("❌ [ERROR] Error fetching search results:", error);
    toast.error("Failed to fetch search results. Please try again.");
    return { data: null, error: error as Error };
  }
};

/**
 * Processes Google search results into a standardized format
 */
export const processSearchResults = (data: GoogleSearchResult): SearchResult[] => {
  if (!data?.items) {
    console.log("ℹ️ [INFO] No items in search results data:", data);
    return [];
  }
  
  console.log("🔍 [DEBUG] Processing search results:", data.items.length);
  
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
