
/**
 * Processes a Clarvida response
 * @param responseText The raw response text from Gemini
 * @param content The original job content
 * @returns Processed response with search string
 */
export function processClarvidaResponse(responseText: string, content: string) {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed JSON response");
    } else {
      console.error("Failed to extract JSON from response:", responseText);
      throw new Error("Could not extract JSON from response");
    }
    
    // Ensure searchString is in the response
    if (!parsedResponse.searchString) {
      console.warn("No searchString found in AI response, attempting to construct one");
      
      // Construct a basic search string from the terms
      if (parsedResponse.terms && parsedResponse.terms.skills && parsedResponse.terms.skills.length > 0) {
        const skills = parsedResponse.terms.skills.map((skill: string) => `"${skill}"`).join(" OR ");
        const titles = parsedResponse.terms.titles && parsedResponse.terms.titles.length > 0 
          ? parsedResponse.terms.titles.map((title: string) => `"${title}"`).join(" OR ") 
          : "";
        
        parsedResponse.searchString = `(${skills})${titles ? ` AND (${titles})` : ""}`;
        console.log("Generated fallback search string:", parsedResponse.searchString);
      } else {
        // If no terms available, create a simple search string from the content
        const keywords = content.split(/\s+/).filter((word: string) => word.length > 5).slice(0, 5);
        parsedResponse.searchString = `(${keywords.join(" OR ")})`;
        console.log("Generated emergency fallback search string:", parsedResponse.searchString);
      }
    }
    
    return parsedResponse;
  } catch (parseError) {
    console.error("Error parsing AI response:", parseError);
    throw parseError;
  }
}
