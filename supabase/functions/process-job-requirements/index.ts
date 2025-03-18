
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
    
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Use specialized prompt for Clarvida source
    let promptText;
    if (source === "clarvida") {
      promptText = promptManager.render(clarvidaPrompt, { content });
      console.log("Using Clarvida prompt");
    } else {
      // Use standard processing (existing code)
      promptText = promptManager.render(defaultPrompt, { content });
      console.log("Using default prompt");
    }

    const result = await model.generateContent(promptText);
    const responseText = result.response.text();
    
    try {
      // Parse JSON from the AI response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let parsedResponse;
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
      
      console.log("Successfully parsed response:", parsedResponse);
      
      // Ensure searchString is in the response
      if (!parsedResponse.searchString) {
        console.warn("No searchString found in AI response, attempting to construct one");
        
        // Construct a basic search string from the terms
        if (parsedResponse.terms && parsedResponse.terms.skills && parsedResponse.terms.skills.length > 0) {
          const skills = parsedResponse.terms.skills.map((skill: string) => `"${skill}"`).join(" OR ");
          const titles = parsedResponse.terms.titles && parsedResponse.terms.titles.length > 0 
            ? parsedResponse.terms.titles.map((title: string) => `"${title}"`).join(" OR ") 
            : "";
          
          parsedResponse.searchString = `(${skills})${titles ? ` AND (${titles})` : ""} site:linkedin.com/in/`;
          console.log("Generated fallback search string:", parsedResponse.searchString);
        }
      }
      
      // Insert the job into the database if a userId is provided
      let jobId;
      if (userId) {
        const { data, error } = await supabaseClient
          .from('jobs')
          .insert({
            user_id: userId,
            content: content,
            output: parsedResponse,
            search_type: searchType,
            company_name: companyName || null,
            source: source || 'default',
            search_string: parsedResponse.searchString
          })
          .select('id')
          .single();
          
        if (error) throw error;
        jobId = data.id;
        console.log("Job created with ID:", jobId);
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
      throw new Error("Failed to parse AI response: " + parseError.message);
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
