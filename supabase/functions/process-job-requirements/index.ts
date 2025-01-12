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
    const { content, searchType, companyName } = await req.json();
    console.log('Processing request:', { 
      contentPreview: content?.substring(0, 100) + '...', 
      searchType, 
      companyName 
    });

    if (!content) {
      throw new Error('Content is required');
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, let's extract the location with a specific prompt
    const locationPrompt = `Extract the nearest major metropolitan area from this text. Follow these rules:

    1. If a specific city is mentioned, return the nearest major metropolitan area (e.g., "Palo Alto" should return "San Francisco Bay Area")
    2. Remove state names and abbreviations (e.g., "CA", "California")
    3. If no location is mentioned, return an empty string
    4. Format as a metropolitan area name only (e.g., "Greater Boston" or "New York City")
    5. Return ONLY the metropolitan area name, nothing else

    Text: ${content}`;

    console.log('Using location prompt:', locationPrompt);
    const locationResult = await model.generateContent(locationPrompt);
    const metroArea = locationResult.response.text().trim();
    console.log('Extracted metro area:', metroArea);

    const searchPrompt = `Create a targeted LinkedIn X-Ray search string for this job description. Follow these rules:

1. Extract 2-4 relevant job titles that are specific to this role
2. Extract 3-6 concrete, technical skills or qualifications (no soft skills)
3. DO NOT include any "NOT" operators or exclusions
4. Format the search string exactly like this:

site:linkedin.com/in/ ${companyName ? '"COMPANY_NAME" AND ' : ''}${metroArea ? '"METRO_AREA" AND ' : ''}("JOB_TITLE_1" OR "JOB_TITLE_2") AND ("SKILL_1" OR "SKILL_2") AND ("SKILL_3" OR "SKILL_4")

Rules:
- Replace placeholders with actual values
- Use proper capitalization
- Include quotes around exact phrases
- Group similar terms with OR
- Connect different term types with AND
- No exclusions or NOT operators
- Keep skills specific and technical (no soft skills)

Job Description: ${content}

Return ONLY the final search string, no explanations.`;

    console.log('Using search prompt:', searchPrompt);
    
    const result = await model.generateContent(searchPrompt);
    const searchString = result.response.text().trim();
    
    console.log('Generated search string:', searchString);

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString,
        metroArea: metroArea || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing the content. Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});