import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Received job requirements:', content);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps create LinkedIn boolean search strings.'
          },
          {
            role: 'user',
            content: `You are sourcing for a person that holds this job title and has these skills: ${content}. Create a boolean string specifically for LinkedIn X-Ray searching. Include the LinkedIn site operator and incorporate a location search. Add a concatenated string of similar job titles to the boolean string. Include as many relevant skills as appropriate and exclude any irrelevant skills. The output should be a single boolean search string, no other information. The format should consistently start with site:linkedin.com/in followed by the rest of the boolean string, including the location element.`
          }
        ],
      }),
    });

    const openAiData = await response.json();
    const searchString = openAiData.choices[0].message.content.trim();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store in Supabase
    const { data, error } = await supabaseClient
      .from('jobs')
      .insert([{ 
        content: content,
        search_string: searchString
      }])
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: 'Job requirements processed successfully',
        searchString: searchString,
        data: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});