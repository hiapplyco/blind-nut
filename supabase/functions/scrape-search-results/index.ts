
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("scrape-search-results function called - this is deprecated");
    
    return new Response(
      JSON.stringify({
        message: 'This function is deprecated. Direct Google CSE integration is now used instead.',
        status: 'deprecated',
        profiles: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deprecated scrape-search-results function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing the request.',
        status: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
