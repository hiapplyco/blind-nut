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
    // Check if API key exists
    const apiKey = Deno.env.get('NYMERIA_API_KEY');
    const hasApiKey = !!apiKey;
    const apiKeyLength = apiKey ? apiKey.length : 0;
    
    // Test Nymeria API with a simple request
    let nymeriaStatus = 'not tested';
    let nymeriaError = null;
    
    if (apiKey) {
      try {
        // Test with a known LinkedIn profile
        const testUrl = 'https://www.linkedin.com/in/williamhgates/';
        const nymeriaUrl = `https://www.nymeria.io/api/v4/person/enrich?profile=${encodeURIComponent(testUrl)}`;
        
        const response = await fetch(nymeriaUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': apiKey
          }
        });
        
        nymeriaStatus = `${response.status} ${response.statusText}`;
        
        if (!response.ok) {
          const errorText = await response.text();
          nymeriaError = errorText.substring(0, 200);
        }
      } catch (error) {
        nymeriaStatus = 'fetch failed';
        nymeriaError = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        environment: {
          hasNymeriaApiKey: hasApiKey,
          apiKeyLength: apiKeyLength,
          nymeriaApiTest: {
            status: nymeriaStatus,
            error: nymeriaError
          }
        },
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});