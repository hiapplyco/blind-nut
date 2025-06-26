
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData).substring(0, 200));
    
    // Check if this is a profile enrichment or a person search request
    if (requestData.profileUrl || requestData.profileId) {
      // Profile enrichment
      return await handleProfileEnrichment(requestData);
    } else if (requestData.searchParams) {
      // Person search
      return await handlePersonSearch(requestData.searchParams);
    } else {
      throw new Error('Invalid request: either profileUrl/profileId or searchParams is required');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: errorMessage,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    };
    
    // Special handling for missing API key
    if (errorMessage.includes('Missing Nymeria API key')) {
      errorDetails.suggestion = 'Please configure NYMERIA_API_KEY in Supabase Edge Functions environment variables';
    }
    
    console.error('Detailed error:', errorDetails);
    
    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleProfileEnrichment(requestData) {
  const { profileUrl, profileId } = requestData;
  
  if (!profileUrl && !profileId) {
    throw new Error('Either profileUrl or profileId is required for profile enrichment');
  }
  
  console.log(`Enriching profile: ${profileUrl || profileId}`);
  
  const apiKey = Deno.env.get('NYMERIA_API_KEY');
  if (!apiKey) {
    console.error('NYMERIA_API_KEY is not set');
    throw new Error('API configuration error: Missing Nymeria API key');
  }
  
  const nymeriaUrl = `https://www.nymeria.io/api/v4/person/enrich?${profileUrl ? `profile=${encodeURIComponent(profileUrl)}` : `lid=${profileId}`}`;
  console.log('Calling Nymeria API:', nymeriaUrl);
  
  // Call Nymeria Person Enrich API
  const nymeriaResponse = await fetch(
    nymeriaUrl, 
    {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    }
  );
  
  if (!nymeriaResponse.ok) {
    const errorText = await nymeriaResponse.text();
    console.error('Nymeria API error:', nymeriaResponse.status, errorText);
    
    // Common error cases
    if (nymeriaResponse.status === 401) {
      throw new Error('Invalid Nymeria API key. Please check your configuration.');
    } else if (nymeriaResponse.status === 404) {
      throw new Error('Profile not found in Nymeria database.');
    } else if (nymeriaResponse.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(`Nymeria API error: ${nymeriaResponse.status} - ${errorText}`);
  }
  
  let enrichedData;
  try {
    enrichedData = await nymeriaResponse.json();
  } catch (parseError) {
    console.error('Failed to parse Nymeria response:', parseError);
    throw new Error('Invalid response from Nymeria API');
  }
  console.log('Nymeria API returned data:', JSON.stringify(enrichedData).substring(0, 200) + '...');
  
  // Skip logging for now since the table doesn't exist
  // TODO: Create enrichment_logs table or remove this functionality
  console.log('Skipping enrichment logging (table does not exist)');
  
  // Return the enriched data
  return new Response(
    JSON.stringify(enrichedData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handlePersonSearch(searchParams) {
  console.log(`Searching for person with params:`, searchParams);
  
  // Construct query string from search parameters
  const queryParams = new URLSearchParams();
  
  // Add all valid search params
  const validParams = [
    'first_name', 'last_name', 'name', 'title', 'company', 
    'industry', 'location', 'country', 'filter', 'require',
    'limit', 'offset'
  ];
  
  validParams.forEach(param => {
    if (searchParams[param]) {
      queryParams.append(param, searchParams[param]);
    }
  });
  
  // Set default limit if not provided
  if (!searchParams.limit) {
    queryParams.append('limit', '10');
  }
  
  const nymeriaSearchUrl = `https://www.nymeria.io/api/v4/person/search?${queryParams.toString()}`;
  console.log(`Making request to: ${nymeriaSearchUrl}`);
  
  // Call Nymeria Person Search API
  const nymeriaResponse = await fetch(
    nymeriaSearchUrl, 
    {
      method: 'GET',
      headers: {
        'X-Api-Key': Deno.env.get('NYMERIA_API_KEY') || ''
      }
    }
  );
  
  if (!nymeriaResponse.ok) {
    console.error('Nymeria API error:', await nymeriaResponse.text());
    throw new Error(`Failed to search for person: ${nymeriaResponse.status}`);
  }
  
  const searchData = await nymeriaResponse.json();
  
  // Skip logging for now since the table doesn't exist
  console.log('Skipping search logging (table does not exist)');
  
  // Return the search results
  return new Response(
    JSON.stringify(searchData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function logEnrichmentAction(action_type, profile_url, search_params) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.warn('Missing Supabase credentials, skipping log entry');
      return;
    }
    
    await fetch(
      `${supabaseUrl}/rest/v1/enrichment_logs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          action_type,
          profile_url,
          search_params,
          status: 'success',
          created_at: new Date().toISOString()
        })
      }
    );
  } catch (error) {
    console.error('Error logging enrichment action:', error);
    // Don't throw error to avoid failing the main operation
  }
}
