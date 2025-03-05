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
      prompt = `You are a search string optimization expert. Extract the most relevant information from the following job requirements and create a precise Google search string to find candidates at ${companyName}:

${content}

First, identify and extract:
- Core job titles/roles
- Essential technical skills and technologies 
- Required qualifications/certifications
- Experience level indicators
- Specialized domain knowledge
- Geographic requirements (if any)

Then construct a search string following these rules:
1. Begin with site:linkedin.com/in to target LinkedIn profiles
2. Include "${companyName}" with appropriate operators
3. Use quotation marks for exact matching of key terms
4. Employ (parentheses) to group related concepts
5. Use OR operators between similar skills/titles and AND between distinct requirements
6. Balance comprehensiveness with precision - include enough terms to find qualified candidates but not so many that results are overly restricted
7. Prioritize terms that truly distinguish qualified candidates

Return ONLY the search string without explanation. Format example:
site:linkedin.com/in ("Title1" OR "Title2") AND "Company" AND ("Skill1" OR "Skill2" OR "Skill3")`;
    } else if (searchType === 'companies') {
      prompt = `You are a search string optimization expert. Extract the most relevant information from the following job requirements and create a precise Google search string to find companies that match these criteria:

${content}

First, identify and extract:
- Industry sectors and sub-sectors
- Key technologies and tools
- Company size indicators
- Business model indicators
- Geographic focus
- Market positioning keywords

Then construct a search string following these rules:
1. Use quotation marks for exact matching of key terms
2. Employ (parentheses) to group related concepts
3. Use OR operators between similar terms and AND between distinct categories
4. Include -site: operators to exclude irrelevant sites when appropriate
5. Add intitle: or intext: operators for key terms that should appear in page titles or content
6. Balance breadth with precision - include enough terms to find relevant companies but avoid over-filtering
7. Prioritize terms that truly distinguish target companies

Return ONLY the search string without explanation. Format example:
("Industry1" OR "Industry2") AND ("Technology1" OR "Technology2") AND ("Location" OR "Remote")`;
    } else {
      prompt = `You are a search string optimization expert. Extract the most relevant information from the following job requirements and create a precise Google search string to find qualified candidates:

${content}

First, identify and extract:
- Core job titles/roles
- Essential technical skills and technologies 
- Required qualifications/certifications
- Experience level requirements
- Specialized domain knowledge
- Geographic requirements (if any)

Then construct a search string following these rules:
1. Begin with site:linkedin.com/in to target LinkedIn profiles
2. Use quotation marks for exact matching of key terms
3. Employ (parentheses) to group related concepts
4. Use OR operators between similar skills/titles and AND between distinct requirements
5. Balance comprehensiveness with precision - include enough terms to find qualified candidates but not so many that results are overly restricted
6. Prioritize terms that truly distinguish qualified candidates

Return ONLY the search string without explanation. Format example:
site:linkedin.com/in ("Title1" OR "Title2") AND ("Skill1" OR "Skill2" OR "Skill3") AND "Location"`;
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
