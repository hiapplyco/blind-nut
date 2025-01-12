import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
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
      const skillsForSearch = Object.keys(normalizedSkills).slice(0, 5).join(' OR ');
      searchString = `site:linkedin.com/in (${skillsForSearch})`;
      if (companyName) {
        searchString += ` "${companyName}"`;
      }
    } else if (searchType === 'companies') {
      searchString = `site:linkedin.com/company "${companyName}"`;
    } else if (searchType === 'candidates-at-company') {
      searchString = `site:linkedin.com/in (${Object.keys(normalizedSkills).slice(0, 5).join(' OR ')}) AND "${companyName}"`;
    }

    console.log('Generated search string:', searchString);

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
    let errorMessage = error.message;
    
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