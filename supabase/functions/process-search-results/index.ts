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
    const { searchString } = await req.json();
    console.log('Processing search string:', searchString);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, let's extract structured profile data from the search results
    const prompt = `You are a professional recruiter assistant. Given this X-Ray search string: "${searchString}", 
    generate 25 example LinkedIn profiles that would match this search. For each profile include:
    1. Full name
    2. Current title
    3. Location
    4. Profile URL (use a realistic format like linkedin.com/in/firstname-lastname-id)
    5. A relevance score from 1-100 based on how well they match the search criteria

    Format the output as a JSON array of objects with these exact keys:
    profile_name, profile_title, profile_location, profile_url, relevance_score`;

    console.log('Using prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('Generated profiles, parsing JSON');
    
    try {
      const profiles = JSON.parse(responseText);
      
      // Store results in the database
      const { data: jobData, error: jobError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/search_results`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify(profiles.map((profile: any) => ({
            ...profile,
            created_at: new Date().toISOString()
          })))
        }
      );

      if (jobError) throw jobError;

      return new Response(
        JSON.stringify({ 
          message: 'Profiles generated and stored successfully',
          profiles 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('Error parsing generated profiles:', parseError);
      throw new Error('Failed to parse generated profiles');
    }

  } catch (error) {
    console.error('Error processing search results:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing the search results'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});