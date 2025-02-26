
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    
    // Get the Gemini API key from environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    console.log('Received message:', { messageLength: message?.length });
    console.log('Context:', context);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the chat messages
    const messages = context || [];
    
    // Create the prompt
    const prompt = `You are a professional interviewer. Based on the candidate's previous responses and the context of the interview, provide a relevant and engaging follow-up question or response. If this is the start of the interview, begin with an appropriate opening question.

Current context:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Candidate's latest input:
${message}

Please provide a natural and engaging response that keeps the interview flowing.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('Generated response:', response);

    return new Response(
      JSON.stringify({ 
        response,
        success: true 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in handle-interview function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
