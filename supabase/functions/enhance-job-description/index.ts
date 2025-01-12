import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
    const { content } = await req.json();
    console.log('Enhancing job description:', content?.substring(0, 100) + '...');

    if (!content) {
      throw new Error('No content provided');
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a Talent Acquisition specialist, enhance this job description using engaging markdown formatting with clear headers and emphasis on key points that will attract top talent:

# 🚀 Enhanced Job Description

## 🏢 Company Impact
- **Mission:** *What makes this company special*
- **Culture:** *Key aspects of work environment*
- **Growth:** *Company trajectory and vision*

## 💫 Role Overview
- **Position Impact:** *How this role contributes to success*
- **Key Objectives:** *What success looks like*
- **Team Context:** *Where this role fits in*

## 📋 Essential Qualifications
- **Technical Skills:** *Must-have technical requirements*
- **Experience:** *Required background*
- **Soft Skills:** *Critical interpersonal abilities*

## 🌟 Preferred Qualifications
- **Advanced Skills:** *Nice-to-have expertise*
- **Industry Knowledge:** *Beneficial background*
- **Additional Assets:** *What sets candidates apart*

## 📈 Growth & Development
- **Career Path:** *Progression opportunities*
- **Learning:** *Professional development support*
- **Mentorship:** *Available guidance and support*

## 🎯 Success Metrics
- **First 90 Days:** *Initial objectives*
- **Long-term Impact:** *Expected contributions*
- **Key Deliverables:** *Major responsibilities*

## 🤝 Next Steps
- **Application Process:** *How to apply*
- **Timeline:** *What to expect*
- **Contact:** *Who to reach out to*

Format the content to be engaging and scannable, using bold for headers and italic for supporting details.
Highlight unique opportunities and growth potential to attract top talent.

Original job description: ${content}`;

    // Add safety timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 25000);
    });

    const resultPromise = model.generateContent(prompt);
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    if (result instanceof Error) {
      throw result;
    }

    const enhancedDescription = result.response.text();
    console.log('Enhanced description generated successfully');
    
    return new Response(
      JSON.stringify({ enhancedDescription }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in enhance-job-description:', error);
    let errorMessage = error.message;
    
    // Handle rate limiting specifically
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      errorMessage = 'API rate limit exceeded. Please try again in a few minutes.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: error.message.includes('429') ? 429 : 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});