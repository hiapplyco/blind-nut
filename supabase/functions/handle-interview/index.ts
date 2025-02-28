
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3/";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

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
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Build the interviewer context
    const interviewerInstructions = `
    You are an AI interviewer helping a candidate practice for a job interview. 
    Your goal is to create a realistic and valuable interview experience.
    
    - Ask relevant questions based on the candidate's responses
    - Provide constructive feedback on their answers
    - Simulate a real interview environment
    - Be supportive but professional
    - Help the candidate improve their interviewing skills
    
    Focus on both technical skills and soft skills. Adapt your questions based on their previous answers.
    `;

    // Create conversation history in the format expected by Gemini
    const conversationHistory = context.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate content
    let chat;
    
    if (conversationHistory.length > 0) {
      // Continue existing chat
      chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });
    } else {
      // Start new chat
      chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });
      
      // Add the interviewer instructions
      await chat.sendMessage({
        role: "user",
        parts: [{ text: interviewerInstructions }],
      });
      
      // Set initial context
      await chat.sendMessage({
        role: "user", 
        parts: [{ text: "I'd like to practice for a job interview. Please start by introducing yourself as the interviewer and asking me an initial question." }]
      });
    }
    
    // Send the user message
    const result = await chat.sendMessage({
      role: "user",
      parts: [{ text: message }]
    });
    
    const response = result.response.text();
    
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
