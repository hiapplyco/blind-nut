import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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
    const { content, searchType, companyName } = await req.json();
    console.log('Processing request:', { searchType, companyName, contentLength: content?.length });
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    let prompt = '';
    if (searchType === 'candidates-at-company') {
      prompt = `You are an expert at generating precise Google search strings using advanced search operators to effectively query LinkedIn profiles.

Analyze these job requirements and create a highly-targeted Google search string to find candidates at ${companyName}:

${content}

Your search string must:
1. Use the site:linkedin.com/in operator to target only LinkedIn profiles
2. Include the company name "${companyName}" with appropriate operators
3. Extract and include key job titles, skills, and qualifications from the requirements
4. Use quotation marks for exact matches where appropriate
5. Utilize logical operators (AND, OR) and parentheses to create a precise query
6. Format specialized skills and technologies with exact syntax for optimal matching

Return ONLY the final search string without additional commentary or explanation.
Example format: site:linkedin.com/in ("Job Title" OR "Skill") AND "Company" AND "Location"`;
    } else if (searchType === 'companies') {
      prompt = `You are an expert at generating precise Google search strings using advanced search operators to find companies.

Analyze these job requirements and create a highly-targeted Google search string:

${content}

Your search string must:
1. Extract industry-specific keywords and market segments from the requirements
2. Include key technologies, tools, and specialized skills
3. Incorporate company size indicators if present
4. Add geographic/location preferences when mentioned
5. Use quotation marks for exact matches where appropriate
6. Utilize logical operators (AND, OR) and parentheses to create a precise query
7. Format the search to target company websites, LinkedIn company pages, or industry directories

Return ONLY the final search string without additional commentary or explanation.`;
    } else {
      prompt = `You are an expert at generating precise Google search strings using advanced search operators to effectively query LinkedIn profiles.

Analyze these job requirements and create a highly-targeted Google search string:

${content}

Your search string must:
1. Use the site:linkedin.com/in operator to target only LinkedIn profiles
2. Extract and include key job titles from the requirements with exact quotes
3. Extract and include essential skills and technologies with appropriate syntax
4. Include experience level indicators where relevant
5. Add location information if specified in the requirements
6. Utilize logical operators (AND, OR) and parentheses to create a precise query

Return ONLY the final search string without additional commentary or explanation.
Example format: site:linkedin.com/in ("Job Title" OR "Skill") AND "Location"`;
    }
    
    const result = await model.generateContent(prompt);
    const searchString = result.response.text().trim();
    
    console.log('Generated search string:', searchString);
    return new Response(
      JSON.stringify({ 
        searchString,
        status: 'success' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-job-requirements:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
