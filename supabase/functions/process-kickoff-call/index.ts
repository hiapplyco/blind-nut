
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

    console.log("Processing kickoff call with Gemini...");
    
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
    const summary = sections[0]?.replace(/^\d+\.\s*/, '').trim() || '';
    
    // Extract key points and action items, handling different potential formats
    const extractItems = (section: string) => {
      const items = section?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, '').trim()) || [];
      return items;
    };
    
    // Try to find sections by looking for headers or numbered sections
    let keyPointsSection = '';
    let actionItemsSection = '';
    
    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('key') && lowerSection.includes('discussion') || 
          lowerSection.includes('key') && lowerSection.includes('points')) {
        keyPointsSection = section;
      } else if (lowerSection.includes('action') || lowerSection.includes('next steps')) {
        actionItemsSection = section;
      }
    }
    
    // If we couldn't find sections by headers, use the remaining sections
    if (!keyPointsSection && sections.length > 1) {
      keyPointsSection = sections[1];
    }
    
    if (!actionItemsSection && sections.length > 2) {
      actionItemsSection = sections[2];
    }
    
    const keyPoints = extractItems(keyPointsSection);
    const actionItems = extractItems(actionItemsSection);

    // Store in database
    console.log("Storing kickoff call in database...");
    
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
      console.error("Error inserting kickoff call:", insertError);
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
