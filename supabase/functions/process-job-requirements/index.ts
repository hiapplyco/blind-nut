import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName } = await req.json();
    console.log('Received content:', content, 'Search type:', searchType, 'Company:', companyName);

    // First, let's try to extract the location using GPT
    const locationPrompt = `Extract only the city name from this text. If no specific city is mentioned, respond with "United States". Return only the location, nothing else: ${content}`;
    
    const locationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts location information.' },
          { role: 'user', content: locationPrompt }
        ],
      }),
    });

    const locationData = await locationResponse.json();
    const location = locationData.choices[0].message.content.trim();
    console.log('Extracted location:', location);

    let prompt;
    if (searchType === 'candidates') {
      prompt = `Create a search string for finding candidates. Start with "(site:linkedin.com/in OR filetype:pdf OR filetype:doc OR filetype:docx)". Include "${location}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    } else if (searchType === 'companies') {
      prompt = `Based on this job description: ${content}, provide TWO pieces of information:
         1. Select the most relevant industry from this list ONLY:
         Accommodation Services
         Administrative and Support Services
         Construction
         Consumer Services
         Education
         Entertainment Providers
         Farming, Ranching, Forestry
         Financial Services
         Government Administration
         Holding Companies
         Hospitals and Health Care
         Manufacturing
         Oil, Gas, and Mining
         Professional Services
         Real Estate and Equipment Rental Services
         Retail
         Technology, Information and Media
         Transportation, Logistics, Supply Chain and Storage
         Utilities
         Wholesale

         2. Extract ONE key characteristic about the type of company (e.g., "startup", "enterprise", "non-profit", "public company", etc.)
         
         Format your response exactly like this, nothing else:
         site:linkedin.com/company/ "${location}" "INDUSTRY" AND "CHARACTERISTIC"`;
    } else if (searchType === 'candidates-at-company') {
      // For candidates at company, we'll just use the raw company name in quotes
      prompt = `Create a search string for finding candidates at a specific company. Start with "(site:linkedin.com/in OR filetype:pdf OR filetype:doc OR filetype:docx)". Include "${location}" AND "${companyName}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates search strings.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const openAiData = await response.json();
    const searchString = openAiData.choices[0].message.content.trim();
    console.log('Final search string:', searchString);

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