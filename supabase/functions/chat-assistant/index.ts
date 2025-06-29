import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  systemPrompt: string;
  history: ChatMessage[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, systemPrompt, history } = await req.json() as RequestBody;

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build conversation history
    const conversationHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    
    // Create the full prompt
    const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

User: ${message}

Assistant: I'll help you with your recruitment needs based on your data and searches.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Return the response
    return new Response(
      JSON.stringify({
        response: text,
        metadata: {
          model: "gemini-2.0-flash",
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Chat assistant error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred processing your request',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});