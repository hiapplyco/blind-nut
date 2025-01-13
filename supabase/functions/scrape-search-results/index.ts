import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { Browser } from "npm:puppeteer";
// import puppeteer from "npm:puppeteer";
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
    console.log('Search string received:', searchString);

    // Temporarily return mock data
    const profiles = [];

    return new Response(
      JSON.stringify({
        message: 'Function temporarily disabled',
        profiles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing the request.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});