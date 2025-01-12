import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Received content:', content, 'Search type:', searchType, 'Company:', companyName);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract metropolitan area
    const locationPrompt = `Extract the nearest major metropolitan area from this text. If a specific city is mentioned, return its corresponding metropolitan area (e.g., "Palo Alto" should return "San Francisco Bay Area", "Cambridge" should return "Greater Boston"). If no location is mentioned, respond with "United States". Return only the metropolitan area name, nothing else: ${content}`;
    const locationResult = await model.generateContent(locationPrompt);
    const location = locationResult.response.text().trim();
    console.log('Extracted metropolitan area:', location);

    // Generate search string based on type
    let searchPrompt;
    if (searchType === 'candidates') {
      searchPrompt = `Create a search string for finding candidates. Start with "site:linkedin.com/in". Include "${location}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    } else if (searchType === 'companies') {
      searchPrompt = `Based on this job description: ${content}, create a LinkedIn company search string following these rules:
      1. Start with 'site:linkedin.com/company'
      2. Include "${location}" in quotes
      3. Select ONE most relevant industry from this list and include it in quotes:
         - Accommodation Services
         - Administrative and Support Services
         - Construction
         - Consumer Services
         - Education
         - Entertainment Providers
         - Farming, Ranching, Forestry
         - Financial Services
         - Government Administration
         - Holding Companies
         - Hospitals and Health Care
         - Manufacturing
         - Oil, Gas, and Mining
         - Professional Services
         - Real Estate and Equipment Rental Services
         - Retail
         - Technology, Information and Media
         - Transportation, Logistics, Supply Chain and Storage
         - Utilities
         - Wholesale
      4. Add 2-3 relevant keywords from the job description that would help find similar companies
      5. Add "followers" to find established companies
      6. Add "employees" to ensure company size relevance
      
      Format your response as a single search string, nothing else. Example:
      site:linkedin.com/company "San Francisco Bay Area" "Technology, Information and Media" software cloud startup followers employees`;
    } else if (searchType === 'candidates-at-company') {
      searchPrompt = `Create a search string for finding candidates at a specific company. Start with "site:linkedin.com/in". Include "${location}" AND "${companyName}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    }

    const result = await model.generateContent(searchPrompt);
    const searchString = result.response.text().trim();
    console.log('Generated search string:', searchString);

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString: searchString
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});