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
    
    // Step 1: Generate sample profiles using Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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
    
    let profiles;
    try {
      profiles = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing generated profiles:', parseError);
      throw new Error('Failed to parse generated profiles');
    }
    
    // Step 2: Enrich profiles with contact information using Nymeria API
    console.log('Enriching profiles with Nymeria API');
    
    // Prepare bulk enrichment request
    const enrichmentRequests = profiles.map((profile: any) => ({
      params: {
        profile: profile.profile_url
      },
      metadata: {
        original_profile: profile
      }
    }));
    
    // Call Nymeria Bulk Person Enrichment API
    const nymeriaResponse = await fetch('https://www.nymeria.io/api/v4/person/enrich/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': Deno.env.get('NYMERIA_API_KEY') || ''
      },
      body: JSON.stringify({
        requests: enrichmentRequests
      })
    });
    
    if (!nymeriaResponse.ok) {
      console.error('Nymeria API error:', await nymeriaResponse.text());
      throw new Error('Failed to enrich profiles with Nymeria API');
    }
    
    const enrichedData = await nymeriaResponse.json();
    console.log(`Received enriched data for ${enrichedData.length} profiles`);
    
    // Step 3: Combine original profiles with enriched data
    const enrichedProfiles = profiles.map((profile: any, index: number) => {
      const enrichment = enrichedData[index];
      
      // If the enrichment was successful, merge the data
      if (enrichment && enrichment.status === 200 && enrichment.data) {
        return {
          ...profile,
          // Add key contact info from Nymeria
          work_email: enrichment.data.work_email || null,
          personal_emails: enrichment.data.personal_emails || [],
          phone_numbers: enrichment.data.phone_numbers || [],
          company: enrichment.data.job_company_name || null,
          enriched: true
        };
      }
      
      // If enrichment failed, keep the original profile
      return {
        ...profile,
        enriched: false
      };
    });
    
    // Step 4: Store results in the database
    const { data: jobData, error: jobError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/search_results`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify(enrichedProfiles.map((profile: any) => ({
          ...profile,
          created_at: new Date().toISOString()
        })))
      }
    );
    
    if (jobError) throw jobError;
    
    // Step 5: Return enriched profiles
    return new Response(
      JSON.stringify({ 
        message: 'Profiles generated, enriched, and stored successfully',
        profiles: enrichedProfiles 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
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
