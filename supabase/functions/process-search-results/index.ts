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
    
    if (!searchString || searchString.trim() === '') {
      throw new Error('Search string is required');
    }
    
    // Ensure the search string includes site:linkedin.com/in/ if not already present
    const finalSearchString = searchString.includes('site:linkedin.com/in/') 
      ? searchString 
      : `${searchString} site:linkedin.com/in/`;
    
    console.log('Using final search string:', finalSearchString);
    
    // Step 1: Generate sample profiles using Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a professional recruiter assistant. Given this X-Ray search string: "${finalSearchString}", 
    generate 25 example LinkedIn profiles that would match this search. For each profile include:
    1. Full name
    2. Current title
    3. Location
    4. Profile URL (use a realistic format like linkedin.com/in/firstname-lastname-id)
    5. A relevance score from 1-100 based on how well they match the search criteria
    Format the output as a JSON array of objects with these exact keys:
    profile_name, profile_title, profile_location, profile_url, relevance_score
    
    IMPORTANT: Return only valid JSON and nothing else. Do not include explanation text before or after the JSON.`;
    
    console.log('Using profile generation prompt');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('Generated profiles, parsing JSON');
    
    let profiles;
    try {
      // Try to parse the entire response as JSON
      profiles = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing generated profiles as direct JSON:', parseError);
      
      // Try to extract JSON from the text response
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        try {
          profiles = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('Error parsing extracted JSON:', extractError);
          throw new Error('Could not parse the generated profiles');
        }
      } else {
        throw new Error('Failed to extract JSON from the Gemini response');
      }
    }
    
    console.log(`Successfully parsed ${profiles.length} profiles`);
    
    // Step 2: Enrich profiles with contact information using Nymeria API
    console.log('Enriching profiles with Nymeria API');
    
    const nymeriaApiKey = Deno.env.get('NYMERIA_API_KEY');
    if (!nymeriaApiKey) {
      console.warn('NYMERIA_API_KEY is not set in environment variables, skipping enrichment');
      // Continue without enrichment
      return new Response(
        JSON.stringify({ 
          message: 'Profiles generated successfully (without enrichment)',
          profiles: profiles.map((profile: any) => ({
            ...profile,
            enriched: false
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
        'X-Api-Key': nymeriaApiKey
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
    
    // Step 4: Return enriched profiles
    return new Response(
      JSON.stringify({ 
        message: 'Profiles generated and processed successfully',
        profiles: enrichedProfiles,
        searchString: finalSearchString
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
