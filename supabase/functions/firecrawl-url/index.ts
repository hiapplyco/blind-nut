
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from 'npm:@mendable/firecrawl-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Received URL to crawl:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not found in environment variables');
      throw new Error('Firecrawl API key not configured');
    }

    console.log('Initializing Firecrawl with API key');
    const firecrawl = new FirecrawlApp({ apiKey });

    console.log('Starting crawl for URL:', url);
    const response = await firecrawl.crawlUrl(url, {
      limit: 10,
      scrapeOptions: {
        formats: ['markdown'],
      }
    });

    console.log('Raw crawl response:', response);

    if (!response.success) {
      throw new Error(response.error || 'Failed to crawl URL');
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response data format:', response);
      throw new Error('Invalid response data format from Firecrawl');
    }

    const text = response.data
      .filter(item => item && typeof item.text === 'string')
      .map(item => item.text)
      .join('\n\n');

    console.log('Processed text:', text);

    return new Response(
      JSON.stringify({
        success: true,
        text: text || 'No content found'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in firecrawl-url function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
