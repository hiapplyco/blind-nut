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

async function analyzeLocation(model: any, content: string) {
  const sanitizedContent = sanitizeContent(content);
  const locationPrompt = `Extract location information from this text: "${sanitizedContent}"
  Return a JSON object with:
  - location: The city name (without state)
  - metropolitanArea: The broader metro area (e.g., "San Francisco Bay Area", "Greater Boston Area")
  If no location found, return "remote" for location and empty string for metropolitanArea.
  Example: { "location": "San Francisco", "metropolitanArea": "San Francisco Bay Area" }`;

  try {
    const locationResponse = await model.generateContent(locationPrompt);
    const locationData = JSON.parse(locationResponse.response.text().replace(/```json\n?|\n?```/g, '').trim());
    console.log('Location analysis result:', locationData);
    return locationData;
  } catch (error) {
    console.error('Error in location analysis:', error);
    return { location: "remote", metropolitanArea: "" };
  }
}

async function extractSkills(model: any, content: string) {
  const sanitizedContent = sanitizeContent(content);
  const skillsPrompt = `Analyze this job description and extract:
  1. Technical skills and tools (e.g., "JavaScript", "React", "AWS")
  2. Job titles or roles (e.g., "Software Engineer", "Full Stack Developer")
  3. Soft skills (e.g., "communication", "leadership")
  
  Return as JSON with arrays:
  {
    "technicalSkills": ["skill1", "skill2"],
    "jobTitles": ["title1", "title2"],
    "softSkills": ["skill1", "skill2"]
  }
  
  Text to analyze: "${sanitizedContent}"`;

  try {
    const skillsResponse = await model.generateContent(skillsPrompt);
    const skills = JSON.parse(skillsResponse.response.text().replace(/```json\n?|\n?```/g, '').trim());
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    return { technicalSkills: [], jobTitles: [], softSkills: [] };
  }
}

async function generateSearchString(model: any, content: string, type: string, location: any, skills: any, companyName?: string) {
  const sanitizedContent = sanitizeContent(content);
  
  // Build location part
  const locationPart = location.metropolitanArea 
    ? `"${location.metropolitanArea}"` 
    : location.location !== "remote" 
      ? `"${location.location}"` 
      : '';

  // Build skills part - wrap each in quotes and join with OR
  const technicalSkillsPart = skills.technicalSkills
    .map((skill: string) => `"${skill}"`)
    .join(' OR ');

  // Build titles part - wrap each in quotes and join with OR
  const titlesPart = skills.jobTitles
    .map((title: string) => `"${title}"`)
    .join(' OR ');

  // Build the base search string
  let searchString = 'site:linkedin.com/in/ ';
  
  // Add company specific search if needed
  if (type === "candidates-at-company" && companyName) {
    searchString += `"${companyName}" `;
  }

  // Add location if available
  if (locationPart) {
    searchString += `${locationPart} `;
  }

  // Add skills and titles with boolean operators
  if (technicalSkillsPart) {
    searchString += `(${technicalSkillsPart}) `;
  }
  
  if (titlesPart) {
    searchString += `(${titlesPart})`;
  }

  console.log('Generated search string:', searchString);
  return searchString.trim();
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
      extractedSkills,
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