
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Set up CORS to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Mock interview response when AI service is unavailable
const getDefaultResponse = (message: string) => {
  const defaultResponses = [
    "Thank you for that response. Could you tell me about a challenging situation you've faced at work and how you handled it?",
    "That's interesting. How would you describe your ideal work environment?",
    "I appreciate your insights. Can you walk me through your approach to problem-solving?",
    "Great. Now, tell me about a time when you had to adapt to a significant change at work.",
    "Could you elaborate on your experience with team collaboration?",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    // Get the request body
    const { message, context = [] } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input: message is required and must be a string', success: false }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400,
        }
      );
    }

    console.log('Interview message received:', message);
    console.log('Context:', context);

    try {
      // TODO: Replace with actual AI service call
      // For now, just returning a mock response
      const response = getDefaultResponse(message);

      return new Response(
        JSON.stringify({ 
          response, 
          success: true 
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error in AI processing:', error);
      
      // Return a default response rather than an error
      const fallbackResponse = getDefaultResponse(message);
      
      return new Response(
        JSON.stringify({ 
          response: fallbackResponse,
          success: true,
          note: "Using fallback response due to AI service issue"
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error handling request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});
