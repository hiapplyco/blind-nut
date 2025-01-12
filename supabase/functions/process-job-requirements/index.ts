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
    System Prompt for Extracting Key Skills, Job Titles, Location and Using Boolean to Search Google
    
    Objective: Extract key skills, similar job titles, and metropolitan area from the text and construct a Google search query using Boolean operators to find relevant talent profiles.

    Instructions:

    1. Extract Key Skills: Identify the most important skills mentioned in the text. Focus on specific technical skills, software knowledge, and industry-relevant keywords.

    2. Extract Similar Job Titles: Identify the main job title and extract related or similar job titles. Consider variations in seniority (e.g., "Senior Software Engineer" vs. "Software Engineer"), alternative titles (e.g., "Data Scientist" vs. "Machine Learning Engineer"), and industry-specific variations.

    3. Extract Metropolitan Area: Identify the nearest major metropolitan area mentioned or implied in the text. If a smaller city is mentioned, use the nearest major metropolitan area (e.g., "Palo Alto" would become "San Francisco Bay Area"). If no location is mentioned, do not include location in the search.

    4. Construct Boolean Query: Use the extracted skills, job titles, and location to build a Google search query with the following structure:

    site:linkedin.com/in/ ${companyName ? `"${companyName}" AND ` : ''}"METROPOLITAN_AREA" AND ("job title 1" OR "job title 2" OR "job title 3") AND ("skill 1" OR "skill 2") AND ("skill 3" OR "skill 4") NOT ("unwanted term 1" OR "unwanted term 2")

    Rules:
    - Enclose each job title and each skill group in parentheses
    - Use OR to connect similar job titles or synonymous skills
    - Use AND to connect different skill groups and job titles
    - Use NOT to exclude irrelevant terms
    - Use quotation marks for exact phrases
    - Keep the number of terms reasonable (3-5 job titles, 4-8 skills)
    - Always start with site:linkedin.com/in/
    - If company name is provided, add it in quotes after site:linkedin.com/in/
    - Include the metropolitan area in quotes if found

    Example:
    For a "Marketing Manager" position in Palo Alto with experience in "content marketing," "SEO":
    site:linkedin.com/in/ "San Francisco Bay Area" AND ("Marketing Manager" OR "Digital Marketing Manager" OR "Growth Marketing Manager") AND ("content marketing" OR "SEO")

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