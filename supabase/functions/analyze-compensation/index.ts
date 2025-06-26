
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { CompensationAgent } from "../_shared/agents/CompensationAgent.ts";
import { ToolRegistry } from "../_shared/tools/ToolRegistry.ts";
import { GoogleWebSearchTool } from "../_shared/tools/GoogleWebSearchTool.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const toolRegistry = new ToolRegistry();
    toolRegistry.register(new GoogleWebSearchTool());

    const agent = new CompensationAgent(genAI, toolRegistry);

    const analysis = await agent.run({ content });
    
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
