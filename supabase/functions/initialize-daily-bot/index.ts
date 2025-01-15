import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!DAILY_API_KEY || !GEMINI_API_KEY) {
      console.error('Missing required API keys:', {
        hasDaily: !!DAILY_API_KEY,
        hasGemini: !!GEMINI_API_KEY
      });
      throw new Error('API keys not configured')
    }

    // Create a Daily room first
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600, // Room expires in 1 hour
          enable_chat: true,
          enable_knocking: false,
          start_video_off: true,
          start_audio_off: false
        }
      })
    });

    if (!roomResponse.ok) {
      const error = await roomResponse.text();
      console.error('Daily room creation failed:', error);
      throw new Error('Failed to create Daily room');
    }

    const roomData = await roomResponse.json();
    console.log('Daily room created:', roomData);

    // Then start the bot in this room
    const botResponse = await fetch('https://api.daily.co/v1/bots/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        room_url: roomData.url,
        bot_profile: "gemini_multimodal_live_2024_12",
        max_duration: 300,
        service_options: {
          gemini_live: {
            voice: "Fenrir"
          }
        },
        services: {
          llm: "gemini_live"
        },
        config: [
          {
            service: "llm",
            options: [
              {
                name: "initial_messages",
                value: [
                  {
                    role: "user",
                    content: "You are an interview preparation agent called 'The Old Grasshopper'. " +
                      "Help candidates prepare for interviews by asking relevant questions and providing feedback. " +
                      "Keep responses concise and natural. Wait for pauses before responding."
                  }
                ]
              }
            ]
          }
        ],
        api_keys: {
          gemini_live: GEMINI_API_KEY
        }
      })
    });

    if (!botResponse.ok) {
      const error = await botResponse.text();
      console.error('Daily bot creation failed:', error);
      throw new Error('Failed to create Daily bot');
    }

    const botData = await botResponse.json();
    console.log('Daily bot initialized:', botData);

    return new Response(JSON.stringify(botData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in initialize-daily-bot:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        info: "Please ensure Daily API key and Gemini API key are properly configured"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})