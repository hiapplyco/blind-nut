import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Major metro area mapping
const cityToMetroArea: { [key: string]: string } = {
  // California
  'Oceanside': 'San Diego',
  'La Jolla': 'San Diego',
  'Carlsbad': 'San Diego',
  'Escondido': 'San Diego',
  'Palo Alto': 'San Francisco',
  'San Jose': 'San Francisco',
  'Mountain View': 'San Francisco',
  'Sunnyvale': 'San Francisco',
  'Berkeley': 'San Francisco',
  'Oakland': 'San Francisco',
  'Sacramento': 'Sacramento',
  'Fresno': 'Fresno',
  'Santa Barbara': 'Los Angeles',
  'Pasadena': 'Los Angeles',
  'Long Beach': 'Los Angeles',
  'Irvine': 'Los Angeles',
  
  // New York
  'Brooklyn': 'New York City',
  'Queens': 'New York City',
  'Bronx': 'New York City',
  'Staten Island': 'New York City',
  'Albany': 'New York City',
  'Buffalo': 'Buffalo',
  'Rochester': 'Rochester',
  
  // Massachusetts
  'Cambridge': 'Boston',
  'Somerville': 'Boston',
  'Brookline': 'Boston',
  'Newton': 'Boston',
  'Worcester': 'Boston',
  
  // Washington
  'Bellevue': 'Seattle',
  'Redmond': 'Seattle',
  'Kirkland': 'Seattle',
  'Tacoma': 'Seattle',
  'Spokane': 'Spokane',
  
  // Texas
  'Arlington': 'Dallas',
  'Plano': 'Dallas',
  'Irving': 'Dallas',
  'Fort Worth': 'Dallas',
  'The Woodlands': 'Houston',
  'Sugar Land': 'Houston',
  'Katy': 'Houston',
  'Round Rock': 'Austin',
  'Cedar Park': 'Austin',
  'Georgetown': 'Austin',
  
  // Illinois
  'Evanston': 'Chicago',
  'Naperville': 'Chicago',
  'Schaumburg': 'Chicago',
  'Oak Park': 'Chicago',
  
  // Other major cities remain as is
  'Chicago': 'Chicago',
  'New York City': 'New York City',
  'Los Angeles': 'Los Angeles',
  'San Francisco': 'San Francisco',
  'Seattle': 'Seattle',
  'Boston': 'Boston',
  'Austin': 'Austin',
  'Dallas': 'Dallas',
  'Houston': 'Houston',
  'Miami': 'Miami',
  'Atlanta': 'Atlanta',
  'Denver': 'Denver',
  'Phoenix': 'Phoenix',
  'Portland': 'Portland',
  'Philadelphia': 'Philadelphia',
  'Washington': 'Washington DC',
  'San Diego': 'San Diego',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName } = await req.json();
    console.log('Received content:', content?.substring(0, 100) + '...', 'Search type:', searchType, 'Company:', companyName);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Add safety timeout for location extraction
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 25000);
    });

    // Extract location and map to major metro area
    const locationPrompt = `Extract just the city name from this text. If no specific city is mentioned, respond with "United States". Return only the city name, nothing else: ${content}`;
    const locationResultPromise = model.generateContent(locationPrompt);
    const locationResult = await Promise.race([locationResultPromise, timeoutPromise]);
    
    if (locationResult instanceof Error) {
      throw locationResult;
    }

    let extractedCity = locationResult.response.text().trim();
    
    // Map the extracted city to its major metro area
    let location = cityToMetroArea[extractedCity] || extractedCity;
    if (location === extractedCity && !Object.values(cityToMetroArea).includes(location)) {
      location = "United States";
    }
    
    console.log('Mapped location:', extractedCity, 'to:', location);

    // Generate search string based on type
    let searchPrompt;
    if (searchType === 'candidates') {
      searchPrompt = `Create a search string for finding candidates. Start with "site:linkedin.com/in". Include "${location}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    } else if (searchType === 'companies') {
      searchPrompt = `Based on this job description: ${content}, create a LinkedIn company search string following these rules:
      1. Start with 'site:linkedin.com/company'
      2. Include "${location}" in quotes
      3. Select 2-3 most relevant industries from this list and combine them with OR operators in parentheses:
         (industry1 OR industry2 OR industry3)
         Choose from:
         - "Accommodation Services"
         - "Administrative and Support Services"
         - "Construction"
         - "Consumer Services"
         - "Education"
         - "Entertainment Providers"
         - "Farming, Ranching, Forestry"
         - "Financial Services"
         - "Government Administration"
         - "Holding Companies"
         - "Hospitals and Health Care"
         - "Manufacturing"
         - "Oil, Gas, and Mining"
         - "Professional Services"
         - "Real Estate and Equipment Rental Services"
         - "Retail"
         - "Technology, Information and Media"
         - "Transportation, Logistics, Supply Chain and Storage"
         - "Utilities"
         - "Wholesale"
      4. Add 2-3 relevant keywords from the job description that would help find similar companies
      
      Format your response as a single search string, nothing else.`;
    } else if (searchType === 'candidates-at-company') {
      searchPrompt = `Create a search string for finding candidates at a specific company. Start with "site:linkedin.com/in". Include "${location}" AND "${companyName}" and then add relevant job titles and skills from this content: ${content}. The output should be a single search string, no other information.`;
    }

    const searchResultPromise = model.generateContent(searchPrompt);
    const result = await Promise.race([searchResultPromise, timeoutPromise]);
    
    if (result instanceof Error) {
      throw result;
    }

    const searchString = result.response.text().trim();
    console.log('Generated search string:', searchString);

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
    let errorMessage = error.message;
    
    // Handle rate limiting specifically
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      errorMessage = 'API rate limit exceeded. Please try again in a few minutes.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: error.message.includes('429') ? 429 : 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});