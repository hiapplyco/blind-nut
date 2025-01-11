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

    if (!content || content.trim().length === 0) {
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

    const prompt = `Extract key terms from this text and categorize them. Return ONLY a JSON object with exactly this format, no other text:
    {
      "skills": ["skill1", "skill2", "skill3"],
      "titles": ["title1", "title2", "title3"],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }

    Rules for extraction:
    - skills: technical skills, tools, programming languages, platforms (3-7 items)
    - titles: job positions, roles, seniority levels (2-5 items)
    - keywords: other important terms specific to the industry or role (3-7 items)
    - keep terms concise (1-3 words max)
    - if a category has no relevant terms, use an empty array []
    
    Text to analyze: ${content}`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Received response from Gemini:', response);
    
    try {
      const parsedResponse = JSON.parse(response.trim());
      
      // Validate the response structure
      if (!parsedResponse.skills || !Array.isArray(parsedResponse.skills) ||
          !parsedResponse.titles || !Array.isArray(parsedResponse.titles) ||
          !parsedResponse.keywords || !Array.isArray(parsedResponse.keywords)) {
        throw new Error('Response missing required arrays');
      }

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
      console.error('Raw response:', response);
      
      // Return a valid fallback response
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
          },
          status: 200 // Return 200 with empty arrays instead of 500
        }
      );
    }

  } catch (error) {
    console.error('Error:', error);
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
        },
        status: 200 // Return 200 with empty arrays instead of 500
      }
    );
  }
});