
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from 'npm:@mendable/firecrawl-js';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are an expert content analyzer. When given webpage content:
1. Extract and organize the key information into clear sections
2. Remove any irrelevant content like navigation menus, footers, and ads
3. Provide a concise analysis focusing on:
   - Main content summary
   - Key details and requirements
   - Important data points
Format the response in clear markdown sections.`;

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

    try {
      // Use Gemini to analyze and organize the content
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nWebpage content:\n${response.text}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      });

      const analyzedText = result.response.text();
      console.log('Successfully analyzed content');

      return new Response(
        JSON.stringify({
          success: true,
          text: analyzedText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (aiError) {
      console.error('Error analyzing content with AI:', aiError);
      // Fallback to raw scraped content if AI analysis fails
      return new Response(
        JSON.stringify({
          success: true,
          text: response.text
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
