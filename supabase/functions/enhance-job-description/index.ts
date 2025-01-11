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
    const { content } = await req.json();
    console.log('Enhancing job description:', content?.substring(0, 100) + '...');

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Enhance this job description using markdown formatting with clear headers. Include:

# Enhanced Job Description

## Company Overview
- Brief, compelling introduction to the company

## Role Overview
- Key responsibilities and objectives

## Required Qualifications
- Must-have skills and experience

## Preferred Qualifications
- Nice-to-have skills and experience

## Growth Opportunities
- Career development possibilities
- Learning opportunities

## Company Culture & Benefits
- Work environment
- Key benefits and perks

## How to Apply
- Clear next steps for candidates

Maintain a professional but engaging tone throughout.

Original job description: ${content}`;

    const result = await model.generateContent(prompt);
    const enhancedDescription = result.response.text();
    
    return new Response(
      JSON.stringify({ enhancedDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-job-description:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});