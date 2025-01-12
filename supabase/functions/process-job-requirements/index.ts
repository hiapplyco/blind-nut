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

    const searchPrompt = `
    Objective: Extract key skills and similar job titles from the text and construct a Google search query using Boolean operators to find relevant talent profiles.

    Instructions:
    1. Extract Key Skills: Identify the most important skills mentioned in the text. Focus on specific technical skills, software knowledge, and industry-relevant keywords.

    2. Extract Similar Job Titles: Identify the main job title and extract related or similar job titles. Consider variations in seniority and alternative titles.

    3. Construct Boolean Query with this structure:
    site:linkedin.com/in/ ${companyName ? `"${companyName}" AND ` : ''}("job title 1" OR "job title 2" OR "job title 3") AND ("skill 1" OR "skill 2") AND ("skill 3" OR "skill 4")

    Rules:
    - Enclose each job title and skill group in parentheses
    - Use OR to connect similar job titles or synonymous skills
    - Use AND to connect different skill groups and job titles
    - Use quotation marks for exact phrases
    - Keep the number of terms reasonable (3-5 job titles, 4-8 skills)
    - Always start with site:linkedin.com/in/
    - If company name is provided, add it in quotes after site:linkedin.com/in/

    Text to analyze: ${content}

    Return ONLY the final search string, no explanations or other text.`;

    console.log('Using search prompt:', searchPrompt);
    
    const result = await model.generateContent(searchPrompt);
    const searchString = result.response.text().trim();
    
    console.log('Generated search string:', searchString);

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString
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