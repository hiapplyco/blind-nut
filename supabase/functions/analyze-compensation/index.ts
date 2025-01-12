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
    console.log('Analyzing compensation for content:', content?.substring(0, 100) + '...');

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();
    
    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-compensation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});