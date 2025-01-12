import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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

    console.log('Analyzing compensation for content:', content?.substring(0, 100) + '...');

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a seasoned Talent Acquisition expert with deep knowledge of compensation structures and market trends, analyze the compensation details in this job description. Format your response in markdown with clear, engaging headers and emphasis on key points. Include:

# 💰 Comprehensive Compensation Analysis

## 📊 Base Salary Range
- **Specified Range:** [Extract or estimate the salary range based on role, location, and industry standards]
- *Market Position:* [How this compares to market averages, whether it's competitive]
- **Location Factor:** [How location impacts the compensation]

## 🎯 Total Compensation Package
- **Performance Bonuses:** [Details of any performance-based compensation]
- **Equity Components:** [Stock options, RSUs, or other equity compensation]
- **Additional Incentives:** [Commission structure, profit sharing, performance bonuses]
- *Total Package Value:* [Estimated total compensation range]

## ✨ Benefits and Perks Analysis
- **Healthcare Coverage:**
  - Medical insurance details
  - Dental and vision coverage
  - Health savings accounts or flexible spending options
- **Time Off Benefits:**
  - Vacation policy
  - Sick leave
  - Paid holidays
  - Parental leave
- **Additional Benefits:**
  - 401(k) or retirement plans
  - Life insurance
  - Disability coverage
  - Professional development allowance

## 📈 Market Context and Competitiveness
- **Industry Alignment:** [How the package compares to industry standards]
- **Competitive Analysis:** [Strengths and potential gaps in the offering]
- **Growth Potential:** [Career progression and compensation growth opportunities]
- *Market Trends:* [Relevant compensation trends in this sector]

## 🌟 Notable Compensation Policies
- **Unique Benefits:** [Standout or unusual perks]
- **Work Arrangement Benefits:** [Remote work stipends, home office allowances]
- **Wellness Programs:** [Health and wellness benefits]
- **Professional Growth:** [Training budgets, certification support]

## 💡 Strategic Insights
- **Attraction Factors:** [Key selling points of the compensation package]
- **Retention Elements:** [Components designed for long-term retention]
- **Areas for Negotiation:** [Flexible components of the package]

If specific numbers aren't provided, provide informed estimates based on:
- Industry standards
- Company size and stage
- Location and market conditions
- Role level and requirements
- Current market trends

Keep sections concise but impactful, using:
- Bold for key figures and important terms
- Italic for contextual insights and market analysis
- Bullet points for clear organization
- Emojis for visual engagement

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