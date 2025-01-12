import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sanitize content to avoid safety blocks
function sanitizeContent(content: string): string {
  return content
    .replace(/[^\w\s.,!?@#$%^&*()-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Safely generate content with retries and error handling
async function safeGenerateContent(model: any, prompt: string, maxRetries = 2) {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`Generation attempt ${i + 1} failed:`, error);
      lastError = error;
      
      // If it's not a safety error, don't retry
      if (!error.message?.includes('SAFETY')) {
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

async function analyzeLocation(model: any, content: string) {
  const sanitizedContent = sanitizeContent(content);
  const locationPrompt = `Extract location from this text: "${sanitizedContent}"
  Return only city name without state. If no location found, return "remote".
  Example: { "location": "San Francisco" }`;

  try {
    const locationResponse = await safeGenerateContent(model, locationPrompt);
    const locationData = JSON.parse(locationResponse.replace(/```json\n?|\n?```/g, '').trim());
    console.log('Location analysis result:', locationData);
    return locationData;
  } catch (error) {
    console.error('Error in location analysis:', error);
    return { location: "remote", metropolitanArea: "" };
  }
}

async function extractSkills(model: any, content: string) {
  const sanitizedContent = sanitizeContent(content);
  const skillsPrompt = `List technical skills from: "${sanitizedContent}"
  Return only an array of strings. If unclear, return empty array.
  Example: ["JavaScript", "React"]`;

  try {
    const skillsText = await safeGenerateContent(model, skillsPrompt);
    const skills = JSON.parse(skillsText.replace(/```json\n?|\n?```/g, '').trim());
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
}

async function generateSearchString(model: any, content: string, type: string, location: any, companyName?: string) {
  const sanitizedContent = sanitizeContent(content);
  const basePrompt = `Create a Google search string for: "${sanitizedContent}"
  Include only essential terms. Keep under 200 chars.
  Start with site:linkedin.com`;

  try {
    const searchString = await safeGenerateContent(model, basePrompt);
    console.log('Generated search string:', searchString);
    return searchString.trim();
  } catch (error) {
    console.error('Error generating search string:', error);
    // Fallback to a basic search string
    const fallbackString = `site:linkedin.com "${sanitizedContent.substring(0, 100)}"`;
    return fallbackString;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName } = await req.json();
    console.log('Processing request:', { 
      contentPreview: content?.substring(0, 100) + '...', 
      searchType, 
      companyName 
    });

    if (!content) {
      throw new Error('Content is required');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Process in parallel for better performance
    const [locationData, extractedSkills] = await Promise.all([
      analyzeLocation(model, content),
      extractSkills(model, content)
    ]);

    const searchString = await generateSearchString(
      model, 
      content, 
      searchType, 
      locationData, 
      companyName
    );

    const response = {
      message: 'Content processed successfully',
      searchString,
      skills: extractedSkills,
      location: locationData
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing the content. Please try again with different content.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});