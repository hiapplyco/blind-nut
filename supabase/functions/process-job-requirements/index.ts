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
    
    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Content is required',
          details: 'Please provide some content to analyze'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (searchType === 'candidates-at-company' && !companyName?.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Company name is required',
          details: 'Please provide a company name for this search type'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing request:', { 
      contentPreview: content?.substring(0, 100) + '...', 
      searchType, 
      companyName 
    });

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

    let searchPrompt;
    if (searchType === 'companies') {
      searchPrompt = `Create a comprehensive LinkedIn X-Ray search string to find similar companies. Follow these rules:

1. Analyze the company description and extract:
   - Primary industry and sector terms (3-4 terms)
   - Company specializations and core offerings (3-4 terms)
   - Key technologies or platforms they use/provide
   - Company size and stage indicators
   - Market focus or target audience

2. Format the search string exactly like this:
site:linkedin.com/company ${metroArea ? `"${metroArea}" AND ` : ''}("INDUSTRY_TERMS") AND ("SPECIALIZATION_TERMS") AND ("TECHNOLOGY_TERMS")

Rules:
- Replace placeholders with actual extracted terms
- Group similar terms with OR operators
- Use proper capitalization for all terms
- Include quotes around multi-word phrases
- Use specific, technical terms (avoid generic terms)
- Aim for 3-4 terms in each group
- If company name provided, exclude it with -"COMPANY_NAME"

Company Description: ${content}`;
    } else if (searchType === 'candidates-at-company') {
      if (!companyName) {
        throw new Error('Company name is required for candidates-at-company search');
      }
      
      searchPrompt = `Create a targeted LinkedIn X-Ray search string to find candidates at ${companyName}. Follow these rules:

1. Extract from the job description:
   - Required technical skills (programming languages, tools, platforms)
   - Technical certifications or qualifications
   - Domain expertise areas
   - Specific technologies or frameworks
   - Industry-specific technical terms

2. Format the search string exactly like this:
site:linkedin.com/in/ "${companyName}" ${metroArea ? `AND "${metroArea}" ` : ''}AND ("TECHNICAL_SKILLS") AND ("DOMAIN_EXPERTISE") AND ("CERTIFICATIONS")

Rules:
- Extract 8-12 most relevant technical terms total
- Group similar skills with OR operators
- Use proper capitalization
- Include quotes around multi-word terms
- Focus ONLY on hard technical skills and qualifications
- NO soft skills or generic terms
- MUST include company name in quotes
- Aim for 3-4 terms in each group

Job Description: ${content}`;
    } else {
      searchPrompt = `Create a comprehensive LinkedIn X-Ray search string for finding candidates. Follow these rules:

1. Extract from the job description:
   - Specific technical skills (languages, frameworks, tools)
   - Technical certifications and qualifications
   - Industry-specific expertise areas
   - Required technologies and platforms
   - Technical job titles and roles

2. Format the search string exactly like this:
site:linkedin.com/in/ ${metroArea ? `"${metroArea}" AND ` : ''}("JOB_TITLES") AND ("TECHNICAL_SKILLS") AND ("DOMAIN_EXPERTISE")

Rules:
- Extract 10-15 most relevant technical terms total
- Include 2-4 relevant job titles
- Group similar terms with OR operators
- Use proper capitalization
- Include quotes around multi-word terms
- Focus ONLY on hard technical skills and qualifications
- NO soft skills or generic terms
- Aim for 3-5 terms in each group
- Be specific and technical (e.g., "React Native" not just "Mobile Development")

Job Description: ${content}`;
    }

    console.log('Using search prompt:', searchPrompt);
    
    const result = await model.generateContent(searchPrompt);
    const searchString = result.response.text().trim();
    
    console.log('Generated search string:', searchString);

    if (!searchString) {
      throw new Error('Failed to generate search string');
    }

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
        error: error.message || 'An error occurred while processing the content',
        details: 'Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});