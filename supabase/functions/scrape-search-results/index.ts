import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Browser } from "npm:puppeteer";
import puppeteer from "npm:puppeteer";
import { supabaseClient } from "../_shared/supabase-client.ts";

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
    console.log('Starting browser automation for search:', searchString);

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to Google search
    const encodedSearch = encodeURIComponent(searchString);
    await page.goto(`https://www.google.com/search?q=${encodedSearch}`);
    
    // Wait for search results to load
    await page.waitForSelector('div.g');

    // Extract LinkedIn profile information
    const profiles = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('div.g');
      
      items.forEach((item, index) => {
        if (index >= 25) return; // Limit to first 25 results
        
        const titleEl = item.querySelector('h3');
        const urlEl = item.querySelector('a');
        const snippetEl = item.querySelector('.VwiC3b');
        
        if (titleEl && urlEl && snippetEl) {
          const fullTitle = titleEl.textContent || '';
          const url = urlEl.href;
          const snippet = snippetEl.textContent || '';
          
          // Extract name and title from the full title
          const titleParts = fullTitle.split(' - ');
          const name = titleParts[0] || '';
          const title = titleParts[1] || '';
          
          // Extract location from snippet if available
          const locationMatch = snippet.match(/(?:Location|Based in|from) (.+?)(?:\.|$)/i);
          const location = locationMatch ? locationMatch[1].trim() : '';
          
          if (url.includes('linkedin.com/in/')) {
            results.push({
              profile_name: name,
              profile_title: title,
              profile_location: location,
              profile_url: url,
              relevance_score: 100 - (index * 4) // Simple relevance score based on position
            });
          }
        }
      });
      
      return results;
    });

    await browser.close();
    console.log(`Found ${profiles.length} LinkedIn profiles`);

    // Store results in Supabase
    if (profiles.length > 0) {
      const { error } = await supabaseClient
        .from('search_results')
        .insert(profiles.map(profile => ({
          ...profile,
          job_id: null // This will be updated by the frontend
        })));

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        message: 'Search results scraped successfully',
        profiles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while scraping search results. Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});