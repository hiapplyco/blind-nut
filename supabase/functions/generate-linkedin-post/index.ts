
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis } = await req.json();
    
    if (!analysis) {
      throw new Error('Analysis is required');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = `Generate final LinkedIn post FROM THIS CONTEXT:\n${analysis}\n
    STRICT REQUIREMENTS:
    - Natural voice matching a professional tone
    - No markdown/formatting
    - Preserve ending hashtags
    - Max 5 sentences/paragraph
    - Include:\n   * Personal anecdote\n   * Devil's Advocate thought\n   * Actionable tip\n   * Humble conclusion`;

    const result = await model.generateContent(prompt);
    const post = result.response.text()
      .replace(/```[\s\S]*?```|`|\*|_/g, "")
      .replace(/^(Sure,? |Certainly,? |Of course,? |Here('?s| is) the post:\s?)/i, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n");
    
    return new Response(JSON.stringify({ post }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-linkedin-post:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
