import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a Talent Acquisition expert, analyze the compensation details in this job description. Format your response in markdown with clear, engaging headers and emphasis on key points. Include:

# 💰 Compensation Analysis

## 📊 Base Salary Range
- **Specified Range:** [Extract or estimate the range]
- *Market Position:* [How this compares to market]

## 🎯 Total Compensation Package
- **Performance Bonuses:** [Details if available]
- **Equity Components:** [Stock options, RSUs, etc.]
- **Additional Incentives:** [Commission, profit sharing, etc.]

## ✨ Benefits Highlights
- **Healthcare:** [Medical, dental, vision coverage]
- **Time Off:** [Vacation, PTO policy]
- **Additional Perks:** [List standout benefits]

## 📈 Market Context
- **Industry Alignment:** [How package compares to industry]
- **Growth Potential:** [Compensation growth opportunities]

## 🌟 Notable Policies
- **Highlight any unique or attractive compensation policies**
- *Include remote work stipends or special allowances*

If specific numbers aren't provided, provide informed estimates based on industry standards, location, and role level.
Keep sections concise but impactful, using bold for key figures and italic for contextual insights.

Job description: ${content}`;

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