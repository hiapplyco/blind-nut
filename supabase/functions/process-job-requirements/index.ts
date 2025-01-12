import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common tech skills categories for normalization
const skillCategories = {
  programming: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift'],
  frameworks: ['React', 'Angular', 'Vue', 'Next.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Express'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra'],
  cloud: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'CloudFormation'],
  tools: ['Git', 'Jenkins', 'CircleCI', 'GitHub Actions', 'Jira', 'Confluence', 'Slack'],
};

// Helper function to normalize and categorize skills
const normalizeSkills = (extractedSkills: string[]): Record<string, boolean> => {
  const normalizedSkills: Record<string, boolean> = {};
  
  // If we have very few skills, add some synthetic ones based on context
  if (extractedSkills.length < 3) {
    // Add basic skills that are commonly required
    normalizedSkills['team_collaboration'] = true;
    normalizedSkills['problem_solving'] = true;
    normalizedSkills['communication'] = true;
    return normalizedSkills;
  }

  // For each extracted skill, normalize and categorize
  extractedSkills.forEach(skill => {
    const normalizedSkill = skill.toLowerCase().trim();
    
    // Check against our categories and normalize to standard names
    for (const [category, skills] of Object.entries(skillCategories)) {
      const matchedSkill = skills.find(s => 
        normalizedSkill.includes(s.toLowerCase()) ||
        s.toLowerCase().includes(normalizedSkill)
      );
      
      if (matchedSkill) {
        normalizedSkills[matchedSkill] = true;
        return;
      }
    }

    // If it's not in our categories, add it directly if it seems valid
    if (normalizedSkill.length > 2 && !normalizedSkill.includes('years')) {
      normalizedSkills[normalizedSkill] = true;
    }
  });

  // If we have too many skills, keep only the most relevant ones
  const maxSkills = 10;
  if (Object.keys(normalizedSkills).length > maxSkills) {
    const prioritySkills = Object.entries(normalizedSkills)
      .slice(0, maxSkills)
      .reduce((acc, [skill, value]) => ({...acc, [skill]: value}), {});
    return prioritySkills;
  }

  return normalizedSkills;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName } = await req.json();
    console.log('Received content:', content?.substring(0, 100) + '...', 'Search type:', searchType, 'Company:', companyName);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Extract skills with a more focused prompt
    const skillsPrompt = `Extract technical and soft skills from this job description. Format as a JSON array of strings. Include only clear, specific skills (no years of experience or vague terms). If the text is unclear, return an empty array:

Input: ${content}

Example output format:
["JavaScript", "React", "AWS", "team leadership", "agile methodologies"]`;

    console.log('Using prompt for skills extraction:', skillsPrompt);

    const skillsResult = await model.generateContent(skillsPrompt);
    const skillsText = skillsResult.response.text().trim();
    let extractedSkills: string[] = [];
    
    try {
      // Clean the response string before parsing
      const cleanedResponse = skillsText.replace(/```json\n?|\n?```/g, '').trim();
      extractedSkills = JSON.parse(cleanedResponse);
      console.log('Successfully extracted skills:', extractedSkills);
    } catch (error) {
      console.error('Error parsing skills:', error);
      extractedSkills = [];
    }

    // Normalize and categorize the extracted skills
    const normalizedSkills = normalizeSkills(extractedSkills);
    console.log('Normalized skills:', normalizedSkills);

    // Generate the search string based on the normalized skills
    let searchString = '';
    
    if (searchType === 'candidates') {
      // New improved prompt for candidate search
      const candidateSearchPrompt = `Create a Google Boolean search string for LinkedIn candidate sourcing based on these requirements:

Job Content: ${content}
Key Skills: ${Object.keys(normalizedSkills).join(', ')}

Rules:
1. Start with 'site:linkedin.com/in'
2. Include job titles and variations in parentheses with OR operators
3. Include 3-5 most critical skills with AND operators
4. Add relevant industry terms if applicable
5. Exclude irrelevant results (e.g., job postings, recruiters) using NOT
6. Keep the string under 300 characters for Google compatibility
7. Focus on finding profiles, not job posts

Example format:
site:linkedin.com/in ("Software Engineer" OR "Backend Developer") AND (Python AND AWS AND Kubernetes) NOT (recruiter OR "job post" OR "we're hiring")

Output only the search string, no explanations.`;

      console.log('Using candidate search prompt:', candidateSearchPrompt);
      
      const searchResult = await model.generateContent(candidateSearchPrompt);
      searchString = searchResult.response.text().trim();
      console.log('Generated candidate search string:', searchString);

      if (companyName) {
        searchString = `${searchString} AND "${companyName}"`;
      }
    } else if (searchType === 'companies') {
      // New improved prompt for company search
      const companySearchPrompt = `Create a Google Boolean search string to find company information on LinkedIn:

Company Name: ${companyName}

Rules:
1. Start with 'site:linkedin.com/company'
2. Include company name variations if applicable
3. Add relevant industry terms if present in the job description
4. Exclude job postings and irrelevant pages
5. Keep the string concise and focused

Output only the search string, no explanations.`;

      console.log('Using company search prompt:', companySearchPrompt);
      
      const searchResult = await model.generateContent(companySearchPrompt);
      searchString = searchResult.response.text().trim();
      console.log('Generated company search string:', searchString);

    } else if (searchType === 'candidates-at-company') {
      // New improved prompt for candidates at specific company
      const candidatesAtCompanyPrompt = `Create a Google Boolean search string to find candidates at a specific company on LinkedIn:

Company: ${companyName}
Job Content: ${content}
Key Skills: ${Object.keys(normalizedSkills).join(', ')}

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

      console.log('Using candidates at company prompt:', candidatesAtCompanyPrompt);
      
      const searchResult = await model.generateContent(candidatesAtCompanyPrompt);
      searchString = searchResult.response.text().trim();
      console.log('Generated candidates at company search string:', searchString);
    }

    return new Response(
      JSON.stringify({
        message: 'Content processed successfully',
        searchString: searchString,
        skills: normalizedSkills
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