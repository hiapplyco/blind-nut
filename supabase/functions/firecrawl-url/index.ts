
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

    console.log('Starting scrape for URL:', url);
    const response = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      blockAds: true,
      removeBase64Images: true,
      timeout: 60000
    });

    console.log('Raw scrape response:', JSON.stringify(response));

    if (!response || response.error) {
      console.error('Error in scrape response:', response?.error || 'Unknown error');
      throw new Error(response?.error || 'Failed to scrape URL');
    }

    // Try multiple possible response formats
    const content = response.text || response.content || response.markdown;
    if (!content) {
      console.error('No content found in response. Full response:', JSON.stringify(response));
      throw new Error('No parseable content found in the response');
    }

    console.log('Successfully extracted content length:', content.length);

    return new Response(
      JSON.stringify({
        success: true,
        text: content
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
