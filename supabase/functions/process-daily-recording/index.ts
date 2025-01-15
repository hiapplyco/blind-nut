import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recordingId } = await req.json()
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')

    if (!DAILY_API_KEY) {
      throw new Error('DAILY_API_KEY not found')
    }

    // Start batch processing job
    const response = await fetch('https://api.daily.co/v1/recordings/batch-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        recording_id: recordingId,
        type: 'transcript',
        format: 'json'
      })
    })

    if (!response.ok) {
      throw new Error(`Daily API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Batch processing job created:', data)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing recording:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})