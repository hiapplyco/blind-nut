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
    const { content, searchType } = await req.json();
    console.log('Received content:', content, 'Search type:', searchType);

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

    // Generate search string using OpenAI
    const prompt = searchType === 'candidates' 
      ? `You are an AI assistant that helps create search strings. Create a search string that combines LinkedIn profiles and resumes for this job: ${content}. The string should start with "(site:linkedin.com/in OR filetype:pdf OR filetype:doc OR filetype:docx)". DO NOT include any location terms as they will be added separately. Add a concatenated string of similar job titles. Include as many relevant skills as appropriate and exclude any irrelevant skills. The output should be a single search string, no other information. Do not include backticks or quotes around the entire string.`
      : `Based on this job description: ${content}, provide TWO pieces of information:
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
         site:linkedin.com/company/ "INDUSTRY" AND "CHARACTERISTIC"`;

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
    let searchString = openAiData.choices[0].message.content.trim();
    console.log('Generated base search string:', searchString);

    // Insert location for both search types
    if (searchType === 'candidates') {
      const siteOperator = "(site:linkedin.com/in OR filetype:pdf OR filetype:doc OR filetype:docx)";
      if (searchString.startsWith(siteOperator)) {
        searchString = `${siteOperator} "${location}" ${searchString.slice(siteOperator.length).trim()}`;
      }
    } else {
      const siteOperator = "site:linkedin.com/company/";
      if (searchString.startsWith(siteOperator)) {
        searchString = `${siteOperator} "${location}" ${searchString.slice(siteOperator.length).trim()}`;
      }
    }
    
    console.log('Final search string:', searchString);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store in Supabase jobs table
    const { data: jobData, error: jobError } = await supabaseClient
      .from('jobs')
      .insert([{ 
        content: content,
        search_string: searchString
      }])
      .select()
      .single();

    if (jobError) throw jobError;

    // Simulate search results
    const mockResults = searchType === 'candidates' ? [
      {
        job_id: jobData.id,
        profile_name: "John Doe",
        profile_title: "Senior Software Engineer",
        profile_location: "San Francisco, CA",
        profile_url: "https://linkedin.com/in/johndoe",
        relevance_score: 95
      },
      {
        job_id: jobData.id,
        profile_name: "Jane Smith",
        profile_title: "Lead Developer",
        profile_location: "New York, NY",
        profile_url: "https://linkedin.com/in/janesmith",
        relevance_score: 90
      }
    ] : [];

    // Store mock results only for candidate searches
    if (searchType === 'candidates') {
      const { error: resultsError } = await supabaseClient
        .from('search_results')
        .insert(mockResults);

      if (resultsError) throw resultsError;
    }

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString: searchString,
        jobId: jobData.id
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