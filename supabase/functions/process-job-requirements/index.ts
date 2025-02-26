
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3/";

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
      prompt = `Given the following job requirements and company name "${companyName}", create a Google search string to find potential candidates:

Job Requirements:
${content}

Focus on:
1. Key skills and technologies mentioned
2. Required experience level
3. Industry-specific requirements
4. Company-specific terminology
5. Location if mentioned

Format the response as a Google search string that will help find LinkedIn profiles of potential candidates at ${companyName}.`;
    } else if (searchType === 'companies') {
      prompt = `Given the following job requirements, create a Google search string to find potential companies:

Job Requirements:
${content}

Focus on:
1. Industry-specific keywords
2. Required technologies and tools
3. Company size indicators
4. Geographic preferences
5. Market segment indicators

Format the response as a Google search string that will help find companies matching these criteria.`;
    } else {
      // Default to candidates search
      prompt = `Given the following job requirements, create a Google search string to find potential candidates:

Job Requirements:
${content}

Focus on:
1. Key skills and technologies required
2. Experience level needed
3. Industry-specific expertise
4. Certifications or qualifications
5. Location preferences if mentioned

Format the response as a Google search string that will help find LinkedIn profiles of qualified candidates.`;
    }

    const result = await model.generateContent([
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]);
    
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
