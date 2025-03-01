
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
const DAILY_API_URL = 'https://api.daily.co/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Make sure we have an API key
    if (!DAILY_API_KEY) {
      console.error('DAILY_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Daily.co API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create random room name
    const roomName = `room-${Math.random().toString(36).substring(2, 11)}`;
    console.log(`Creating Daily.co room: ${roomName}`);

    // Create room via Daily.co API
    const dailyRes = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12, // 12 hours from now
          enable_recording: 'cloud',
          enable_screenshare: true,
          enable_chat: true,
        },
      }),
    });

    if (!dailyRes.ok) {
      const errorData = await dailyRes.text();
      console.error(`Daily.co API error: ${dailyRes.status} - ${errorData}`);
      return new Response(
        JSON.stringify({ error: `Failed to create Daily.co room: ${dailyRes.statusText}` }),
        {
          status: dailyRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await dailyRes.json();
    console.log('Daily.co room created successfully:', data);
    
    return new Response(
      JSON.stringify({ 
        url: data.url,
        name: roomName,
        token: null // You could add token generation if needed
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating Daily.co room:', error.message);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
