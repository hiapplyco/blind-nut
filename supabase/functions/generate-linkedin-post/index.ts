
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
    const { content, link } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Generate a compelling LinkedIn post about: ${content}${link ? `\nInclude this link: ${link}` : ''}\n
    Follow these requirements:
    - Write in a professional yet conversational tone
    - Include 1-2 relevant hashtags at the end
    - Keep paragraphs short (2-3 sentences maximum)
    - Include a thought-provoking question or call to action
    - Total length should be 200-300 words
    - Focus on recruitment and hiring perspective if relevant`;

    const result = await model.generateContent([
      {
        text: prompt,
      }
    ]);

    const post = result.response.text()
      .replace(/^(Sure|Here's|I'll|Let me|Certainly|Of course)[^]*?(?=\n|$)/i, '')
      .trim();
    
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
