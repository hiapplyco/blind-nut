import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Start the Python WebSocket server if not already running
    // For development, we'll use localhost:9080 as specified in the Python script
    const websocketUrl = "ws://localhost:9080";
    
    // In production, you would need to manage the Python server deployment
    // and use the appropriate WebSocket URL

    return new Response(
      JSON.stringify({ 
        success: true,
        websocket_url: websocketUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error initializing bot:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initialize bot',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});