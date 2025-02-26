
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { schema } = await req.json();

    const prompt = `
      Analyze this Zod schema and create a structured JSON documentation that includes:
      1. All fields and their types
      2. Any validation rules (min/max lengths, patterns, etc.)
      3. Whether fields are optional or required
      4. Any custom error messages
      5. Any enum values or constant arrays used
      
      Schema to analyze:
      ${schema}
      
      Format the response as a JSON object with this structure:
      {
        "fields": [
          {
            "name": "fieldName",
            "type": "string|number|etc",
            "required": true|false,
            "validations": [
              {
                "rule": "min|max|pattern|etc",
                "value": "the validation value",
                "message": "error message if specified"
              }
            ],
            "enumValues": ["value1", "value2"] // if applicable
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let textResponse = response.text();
    
    // Try to parse the text as JSON to ensure it's valid
    try {
      // Extract JSON if it's wrapped in backticks
      if (textResponse.includes('```json')) {
        textResponse = textResponse.split('```json')[1].split('```')[0].trim();
      } else if (textResponse.includes('```')) {
        textResponse = textResponse.split('```')[1].split('```')[0].trim();
      }
      
      const parsedJson = JSON.parse(textResponse);
      return new Response(JSON.stringify(parsedJson), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Raw response:', textResponse);
      throw new Error('Failed to generate valid JSON documentation');
    }
  } catch (error) {
    console.error('Error in analyze-schema function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
