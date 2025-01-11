import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this text and extract key terms in these categories:
    1. Skills & Technologies (technical skills, tools, programming languages, etc.)
    2. Job Titles (positions, roles, job levels)
    3. Keywords (other important terms, industry-specific vocabulary)
    
    Format the response as a JSON object with these exact keys: "skills", "titles", "keywords".
    Each should be an array of strings, with 3-7 most relevant terms per category.
    Keep terms concise (1-3 words max).
    Text to analyze: ${content}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const parsedResponse = JSON.parse(response);
      return new Response(
        JSON.stringify(parsedResponse),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Invalid response format from Gemini');
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});