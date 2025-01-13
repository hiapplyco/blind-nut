import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
    const { content } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Given this job description, create:
1. A concise, professional title (maximum 6 words) that summarizes the role
2. A brief summary (2-3 sentences) highlighting the key aspects of the position

Format the response as JSON with 'title' and 'summary' fields. Here's the job description:

${content}`;

    try {
      const result = await model.generateContent(prompt);
      const response = JSON.parse(result.response.text());
      
      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            shouldRetry: true,
            retryAfter: 60 // Suggest retry after 60 seconds
          }),
          { 
            status: 429,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          }
        );
      }
      
      throw error; // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate title and summary',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});