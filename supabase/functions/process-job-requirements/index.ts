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

    const searchPrompt = `
    System Prompt for Extracting Key Skills and Job Titles for Boolean Search

    Objective: Extract key skills, similar job titles, and construct a Google search query using Boolean operators to find relevant talent profiles.

    Instructions:

    1. Extract Key Skills: Identify the most important skills mentioned in the text. Focus on specific technical skills, software knowledge, and industry-relevant keywords.
    - Include ONLY concrete, specific technical skills and technologies
    - Exclude generic terms like "experience" or "knowledge"
    - Keep each skill concise (1-3 words maximum)
    - Format consistently (e.g., "React.js" not "reactjs")

    2. Extract Similar Job Titles: Identify the main job title and extract related or similar job titles.
    - Consider variations in seniority
    - Include alternative titles
    - Keep titles specific and relevant

    3. Construct Boolean Query: Use the extracted skills and job titles to build a Google search query with the following structure:

    site:linkedin.com/in/ ${companyName ? `"${companyName}" AND ` : ''}${metroArea ? `"${metroArea}" AND ` : ''}("job title 1" OR "job title 2" OR "job title 3") AND ("skill 1" OR "skill 2") AND ("skill 3" OR "skill 4") NOT ("unwanted term 1" OR "unwanted term 2")

    Rules:
    - Enclose each job title and each skill group in parentheses
    - Use OR to connect similar job titles or synonymous skills
    - Use AND to connect different skill groups and job titles
    - Use NOT to exclude irrelevant terms
    - Use quotation marks for exact phrases
    - Keep the number of terms reasonable (3-5 job titles, 4-8 skills)
    - Always start with site:linkedin.com/in/

    Text to analyze: ${content}

    Return ONLY the final search string, no explanations or other text.`;

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