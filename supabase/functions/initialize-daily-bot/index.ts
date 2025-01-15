import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    // Validate API keys
    if (!DAILY_API_KEY) {
      console.error('DAILY_API_KEY is not configured')
      throw new Error('DAILY_API_KEY not configured')
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      throw new Error('GEMINI_API_KEY not configured')
    }

    console.log('Creating Daily room...')
    
    // Create Daily room
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: true,
          start_audio_off: false
        }
      })
    });

    if (!roomResponse.ok) {
      const error = await roomResponse.text()
      console.error('Daily room creation failed:', error)
      throw new Error(`Failed to create Daily room: ${error}`)
    }

    const roomData = await roomResponse.json()
    console.log('Daily room created:', roomData)

    // Start bot in room
    console.log('Starting bot in room:', roomData.url)
    
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
                    content: "You are an interview sensei called Old Grasshopper, providing real-time, interactive coaching. I will ask you questions to determine how best to assist with interview preparation now. First, please tell me which type of interview you are preparing for, and how you would like to practice in this session. I can ask you practice questions, provide feedback on your answers as you speak, analyze your environment, and even comment on what you are wearing! Keep your responses clear and succinct. When you detect I have finished speaking, it is your turn to respond. If you need more clarity, please ask me a follow-up question. When you finish speaking, I will wait to detect your pause before replying. If you notice a gap and I'm not speaking, please prompt me to continue. Remember, my responses will be converted to audio, so please only use '!' or '?' as special characters!"
                  }
                ]
              },
              {
                name: "run_on_config",
                value: true
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
      const error = await botResponse.text()
      console.error('Daily bot creation failed:', error)
      throw new Error(`Failed to create Daily bot: ${error}`)
    }

    const botData = await botResponse.json()
    console.log('Daily bot initialized:', botData)

    return new Response(JSON.stringify(botData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in initialize-daily-bot:', error)
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