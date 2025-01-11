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
    console.log('Received content:', content?.substring(0, 100) + '...');

    if (!content || content.trim().length === 0) {
      console.log('Empty content received, returning empty arrays');
      return new Response(
        JSON.stringify({ 
          skills: [], 
          titles: [], 
          keywords: [] 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this text and extract key terms into specific categories. Format your response EXACTLY as a JSON object with these arrays:

{
  "skills": ["skill1", "skill2"],
  "titles": ["title1", "title2"],
  "keywords": ["keyword1", "keyword2"]
}

Guidelines:
- skills: technical skills, tools, technologies (3-7 items)
- titles: job titles and roles (2-5 items)
- keywords: other important terms (3-7 items)
- keep terms short (1-3 words)
- use empty arrays [] if no terms found
- ONLY return the JSON object, no other text

Text to analyze: ${content}`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Raw Gemini response:', response);
    
    try {
      // Clean the response string before parsing
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (!Array.isArray(parsedResponse.skills) || 
          !Array.isArray(parsedResponse.titles) || 
          !Array.isArray(parsedResponse.keywords)) {
        throw new Error('Invalid response structure');
      }

      console.log('Successfully parsed response:', parsedResponse);
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
      console.error('Raw response that failed parsing:', response);
      
      // Return a fallback response instead of throwing
      return new Response(
        JSON.stringify({
          skills: [],
          titles: [],
          keywords: [],
          error: 'Failed to parse terms'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

  } catch (error) {
    console.error('Error in extract-nlp-terms:', error);
    return new Response(
      JSON.stringify({
        skills: [],
        titles: [],
        keywords: [],
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});