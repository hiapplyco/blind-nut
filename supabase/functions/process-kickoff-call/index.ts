
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, title, filePaths } = await req.json();

    // Input validation
    if (typeof text !== 'string' || typeof title !== 'string') {
      throw new Error('Invalid input: text and title must be strings');
    }

    if (!Array.isArray(filePaths)) {
      throw new Error('Invalid input: filePaths must be an array');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Error getting user');
    }

    // Process with Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze this recruiting kickoff call information and provide:
      1. A concise summary (3-4 sentences)
      2. Key discussion points (as a list)
      3. Action items and next steps (as a list)

      Here's the content:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response into sections
    const sections = response.split('\n\n');
    const summary = sections[0];
    const keyPoints = sections[1]?.split('\n').filter(point => point.trim().length > 0) ?? [];
    const actionItems = sections[2]?.split('\n').filter(item => item.trim().length > 0) ?? [];

    // Store in database
    const { data: kickoffCall, error: insertError } = await supabaseClient
      .from('kickoff_calls')
      .insert({
        user_id: user.id,
        title,
        content: text,
        summary,
        key_points: keyPoints,
        action_items: actionItems,
        file_paths: filePaths
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error inserting kickoff call: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        summary,
        keyPoints,
        actionItems,
        id: kickoffCall.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing kickoff call:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
