import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { WebSocket } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ws = new WebSocket("ws://localhost:9080");
    
    if (!ws) {
      throw new Error("Failed to connect to Gemini websocket server");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        websocket_url: "ws://localhost:9080"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});