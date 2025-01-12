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
    console.log('Summarizing job content:', content?.substring(0, 100) + '...');

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As a Talent Acquisition professional, create a compelling summary of this job description using clear markdown formatting:

# 📝 Job Summary

## 🎯 Position Snapshot
- **Role:** *[Job title and level]*
- **Industry:** *[Domain/sector]*
- **Location:** *[Work arrangement - remote/hybrid/onsite]*

## 💫 Key Responsibilities
- **Primary Focus:** *[Main objective]*
- **Core Duties:** *[3-4 key responsibilities]*
- **Impact Areas:** *[Where this role makes a difference]*

## 🎓 Essential Requirements
- **Must-Have Skills:** *[Critical technical skills]*
- **Experience Level:** *[Years/background needed]*
- **Key Competencies:** *[Important soft skills]*

Format the content to be engaging and concise, using bold for categories and italic for details.
Focus on what would most interest potential candidates.

Job description: ${content}`;

    console.log('Using prompt for job summary:', prompt);
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    console.log('Job summary generated successfully');
    
    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});