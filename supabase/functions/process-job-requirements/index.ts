
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { promptManager } from "../_shared/prompts/promptManager.ts";
import { clarvidaPrompt } from "../_shared/prompts/clarvida.prompt.ts";
import { defaultPrompt } from "../_shared/prompts/default.prompt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { content, searchType, companyName, userId, source } = await req.json();
    
    console.log("Processing job requirements with params:", { searchType, companyName, source });
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use specialized prompt for Clarvida source
    let promptText;
    if (source === "clarvida") {
      promptText = promptManager.render(clarvidaPrompt, { content });
      console.log("Using Clarvida prompt");
    } else {
      // Use standard processing with the updated default prompt
      promptText = promptManager.render(defaultPrompt, { content, searchType, companyName });
      console.log("Using default prompt");
    }
    
    console.log("Sending prompt to Gemini API");
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();
    console.log("Received response from Gemini API:", responseText);
    
    // For default search behavior, just return the search string directly
    if (source !== "clarvida") {
      // Remove any site:linkedin.com/in/ that might be in the response as it's already configured in the CSE
      let searchString = responseText.trim();
      console.log("Search string before processing:", searchString);
      
      // Create job record if a userId is provided
      if (userId) {
        try {
          // Only include fields that exist in the jobs table
          const jobData = {
            user_id: userId,
            content: content,
            search_string: searchString,
            source: source || 'default'
          };
          
          // Add optional fields if they are supported by the table schema
          // We need to check if these fields are in the schema before adding them
          const { data, error } = await supabaseClient
            .from('jobs')
            .insert(jobData)
            .select('id')
            .single();
            
          if (error) {
            console.error("Error inserting job:", error);
            throw error;
          }
          
          console.log("Job created with ID:", data.id);
          
          return new Response(
            JSON.stringify({
              success: true,
              searchString: searchString,
              jobId: data.id
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue execution and return the search string even if DB operation fails
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          searchString: searchString
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // For Clarvida source, try to parse JSON from the AI response
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
      
      // Insert the job analysis into the database if a userId is provided
      let jobId;
      if (userId) {
        try {
          // Only include fields that exist in the jobs table
          const jobData = {
            user_id: userId,
            content: content,
            output: parsedResponse,
            source: source || 'default',
            search_string: parsedResponse.searchString
          };
          
          const { data, error } = await supabaseClient
            .from('jobs')
            .insert(jobData)
            .select('id')
            .single();
            
          if (error) {
            console.error("Error inserting job:", error);
            throw error;
          }
          jobId = data.id;
          console.log("Job created with ID:", jobId);
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue execution and return the analysis even if DB operation fails
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          data: parsedResponse,
          jobId,
          searchString: parsedResponse.searchString
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to parse AI response: ${parseError.message}`,
          rawResponse: responseText
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error("Error processing job requirements:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
