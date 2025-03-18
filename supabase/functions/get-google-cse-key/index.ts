
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get API key from environment variable
    const apiKey = Deno.env.get('GOOGLE_CSE_API_KEY');
    
    console.log("GOOGLE_CSE_API_KEY present:", !!apiKey);
    console.log("API key type:", typeof apiKey);
    console.log("API key length:", apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error("GOOGLE_CSE_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          message: "GOOGLE_CSE_API_KEY is not set on the server",
          debug: "Please set this environment variable in the Supabase dashboard under Settings > API > Edge Functions"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the API key
    console.log("Successfully retrieved API key, returning to client");
    return new Response(
      JSON.stringify({ 
        key: apiKey,
        debug: {
          keyLength: apiKey.length,
          keyFirstChar: apiKey.charAt(0),
          keyLastChar: apiKey.charAt(apiKey.length - 1),
          cseId: 'b28705633bcb44cf0' // Verify that we're using the correct CSE ID
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in get-google-cse-key function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        stack: error.stack || "No stack trace available",
        timeStamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
