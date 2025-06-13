
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { compensationPrompt } from "../_shared/prompts/compensation.prompt.ts";
import { promptManager } from "../_shared/prompts/promptManager.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (!req.body) {
      throw new Error('Request body is required');
    }

    const { content } = await req.json();
    
    if (!content) {
      throw new Error('Content is required in request body');
    }

    console.log('Analyzing compensation for content:', content?.substring(0, 100) + '...');

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use the prompt template
    const prompt = promptManager.render(compensationPrompt, { content });
    console.log('Using prompt for compensation analysis:', prompt);

    // Add safety timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 25000);
    });

    const resultPromise = model.generateContent(prompt);
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    if (result instanceof Error) {
      throw result;
    }

    const analysis = result.response.text();
    console.log('Compensation analysis completed successfully');
    
    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in analyze-compensation:', error);
    
    // Determine appropriate status code
    let status = 500;
    if (error.message.includes('not configured')) status = 503;
    if (error.message.includes('required')) status = 400;
    if (error.message.includes('rate limit') || error.message.includes('429')) status = 429;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
