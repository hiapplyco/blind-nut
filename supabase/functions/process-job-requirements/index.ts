import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function analyzeLocation(model: any, content: string) {
  const locationPrompt = `Extract the location information from this job description and determine the nearest major metropolitan area. Return ONLY the major city name without state abbreviations (e.g., "Los Angeles" not "Los Angeles, CA"). Return the result as a JSON object with two properties: "location" (the original location mentioned) and "metropolitanArea" (the nearest major metropolitan area name only). If no location is mentioned, use "remote" as the location and leave metropolitanArea empty.

Rules for metropolitanArea:
1. Use only the city name without state abbreviations
2. For major cities, use their common names (e.g., "New York City", "Los Angeles", "Chicago")
3. Always map to the nearest major metropolitan area (e.g., "Palo Alto" should map to "San Francisco")
4. Do not include state abbreviations or additional location information

Example output:
{
  "location": "Carlsbad, California",
  "metropolitanArea": "San Diego"
}

Job description: ${content}`;

  console.log('Analyzing location with prompt:', locationPrompt);
  const locationResult = await model.generateContent(locationPrompt);
  const locationData = JSON.parse(locationResult.response.text());
  console.log('Location analysis result:', locationData);
  return locationData;
}

async function extractSkills(model: any, content: string) {
  const skillsPrompt = `Extract only the specific technical skills, tools, and technologies mentioned in this job description. Format as a JSON array of strings. Include only clear, specific skills mentioned in the text. If the text is unclear, return an empty array.

Input: ${content}

Example output format:
["JavaScript", "React", "AWS"]`;

  console.log('Extracting skills with prompt:', skillsPrompt);
  const skillsResult = await model.generateContent(skillsPrompt);
  const skillsText = skillsResult.response.text().trim();
  
  try {
    const cleanedResponse = skillsText.replace(/```json\n?|\n?```/g, '').trim();
    const skills = JSON.parse(cleanedResponse);
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error parsing skills:', error);
    return [];
  }
}

async function generateCandidateSearchString(model: any, content: string, skills: string[], location: any, companyName?: string) {
  const wrapInQuotes = (term: string) => {
    return term.includes(' ') ? `"${term}"` : term;
  };

  const candidateSearchPrompt = `Create a Google Boolean search string for LinkedIn candidate sourcing based on these requirements:

Job Content: ${content}
Key Skills: ${skills.map(wrapInQuotes).join(', ')}
Location: ${location.metropolitanArea || location.location || 'Remote'}

Rules:
1. Start with 'site:linkedin.com/in OR site:linkedin.com/pub'
2. Include job titles and variations in parentheses with OR operators
3. Include 3-5 most critical skills with AND operators
4. Add the metropolitan area in quotes (e.g. "San Francisco Bay Area")
5. Exclude irrelevant results using -intitle:"profiles" -inurl:"dir/ "
6. Keep the string under 300 characters for Google compatibility
7. Focus on finding profiles, not job posts
8. Wrap any multi-word terms in double quotes (e.g. "product manager" instead of product manager)

Example format:
("Software Engineer" OR "Backend Developer") AND ("Python" AND "Amazon Web Services" AND "Kubernetes") "San Francisco Bay Area" -intitle:"profiles" -inurl:"dir/ " site:linkedin.com/in OR site:linkedin.com/pub

Output only the search string, no explanations.`;

  console.log('Generating candidate search string with prompt:', candidateSearchPrompt);
  const searchResult = await model.generateContent(candidateSearchPrompt);
  let searchString = searchResult.response.text().trim();
  console.log('Generated candidate search string:', searchString);

  if (companyName) {
    searchString = `${searchString} AND "${companyName}"`;
  }
  
  return searchString;
}

async function generateCompanySearchString(model: any, companyName: string) {
  const companySearchPrompt = `Create a Google Boolean search string to find company information on LinkedIn:

Company Name: ${companyName}

Rules:
1. Start with 'site:linkedin.com/company'
2. Include company name variations if applicable
3. Add relevant industry terms if present in the job description
4. Exclude job postings and irrelevant pages
5. Keep the string concise and focused

Output only the search string, no explanations.`;

  console.log('Generating company search string with prompt:', companySearchPrompt);
  const searchResult = await model.generateContent(companySearchPrompt);
  const searchString = searchResult.response.text().trim();
  console.log('Generated company search string:', searchString);
  return searchString;
}

async function generateCandidatesAtCompanyString(model: any, content: string, skills: string[], companyName: string) {
  const candidatesAtCompanyPrompt = `Create a Google Boolean search string to find candidates at a specific company on LinkedIn:

Company: ${companyName}
Job Content: ${content}
Key Skills: ${skills.join(', ')}

Rules:
1. Start with 'site:linkedin.com/in'
2. Include current company name with exact match
3. Include relevant job titles with OR operators
4. Add 2-3 most critical skills with AND operators
5. Exclude irrelevant results
6. Keep the string under 300 characters
7. Focus on finding current employees

Example format:
site:linkedin.com/in "Current Company Name" AND ("Software Engineer" OR "Developer") AND (Python AND AWS) NOT (recruiter OR "job post")

Output only the search string, no explanations.`;

  console.log('Generating candidates at company string with prompt:', candidatesAtCompanyPrompt);
  const searchResult = await model.generateContent(candidatesAtCompanyPrompt);
  const searchString = searchResult.response.text().trim();
  console.log('Generated candidates at company search string:', searchString);
  return searchString;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName } = await req.json();
    console.log('Processing request:', { content: content?.substring(0, 100) + '...', searchType, companyName });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const locationData = await analyzeLocation(model, content);
    const extractedSkills = await extractSkills(model, content);

    let searchString = '';
    
    switch (searchType) {
      case 'candidates':
        searchString = await generateCandidateSearchString(model, content, extractedSkills, locationData, companyName);
        break;
      case 'companies':
        searchString = await generateCompanySearchString(model, companyName);
        break;
      case 'candidates-at-company':
        searchString = await generateCandidatesAtCompanyString(model, content, extractedSkills, companyName);
        break;
    }

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString,
        skills: extractedSkills,
        location: locationData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
