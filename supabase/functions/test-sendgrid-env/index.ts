// Test function to check environment variables
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL')
    const senderName = Deno.env.get('SENDER_NAME')
    
    // Check if variables exist (without exposing the actual values)
    const result = {
      hasSendGridKey: !!sendGridApiKey,
      sendGridKeyLength: sendGridApiKey?.length || 0,
      sendGridKeyPrefix: sendGridApiKey?.substring(0, 7) || 'not set',
      senderEmail: senderEmail || 'not set',
      senderName: senderName || 'not set',
      allEnvKeys: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('SEND') || key.includes('EMAIL') || key.includes('NAME')
      )
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to check environment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})