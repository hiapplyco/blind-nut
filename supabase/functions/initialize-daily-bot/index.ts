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
    const response = await fetch('https://api.daily.co/v1/bots/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
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
                    content: "You are an interview preparation agent called 'The Old Grasshopper', assisting in a real-time setting. " +
                      "I will ask you questions to understand how best to help you with your interview preparation now. " +
                      "First, please tell me what kind of interview you are preparing for, and how you would like to prep in this session. " +
                      "I can ask you practice questions, give you feedback on your answers as you speak, " +
                      "analyze the room you are in, and even describe what you are wearing! " +
                      "Keep your responses brief and easy to understand. " +
                      "When you detect I have finished speaking, it is your turn to respond. " +
                      "If you need more clarity, please ask me a follow-up question. " +
                      "When you finish speaking, I will wait to detect your pause before replying. " +
                      "If you notice a gap and I'm not speaking, please prompt me to continue. " +
                      "Remember, my responses will be converted to audio, so only use ! or ? for special characters!"
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
    })

    const data = await response.json()
    console.log('Daily bot initialized:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error initializing Daily bot:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})