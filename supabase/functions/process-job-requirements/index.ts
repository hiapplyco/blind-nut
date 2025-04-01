
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { promptManager } from "../_shared/prompts/promptManager.ts";
import { clarvidaPrompt } from "../_shared/prompts/clarvida.prompt.ts";
import { defaultPrompt } from "../_shared/prompts/default.prompt.ts";
import { corsHeaders } from "./cors.ts";
import { generateContent } from "./gemini.ts";
import { createJobRecord } from "./db.ts";
import { processClarvidaResponse } from "./clarvida.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { content, searchType, companyName, userId, source } = await req.json();
    
    console.log("Processing job requirements with params:", { searchType, companyName, source });
    
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
    
    const responseText = await generateContent(promptText);
    
    // For default search behavior, just return the search string directly
    if (source !== "clarvida") {
      // Remove any site:linkedin.com/in/ that might be in the response as it's already configured in the CSE
      let searchString = responseText.trim();
      console.log("Search string before processing:", searchString);
      
      // Create job record if a userId is provided
      if (userId) {
        try {
          const jobId = await createJobRecord(userId, content, searchString, source || 'default', searchType);
          
          return new Response(
            JSON.stringify({
              success: true,
              searchString: searchString,
              jobId: jobId
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
      const parsedResponse = processClarvidaResponse(responseText, content);
      
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
