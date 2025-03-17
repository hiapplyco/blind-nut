
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { content, source = 'clarvida' } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    console.log(`Generating Clarvida report for content length: ${content.length}`);
    
    // This is where we'll store all the report data we generate
    const reportData: Record<string, any> = {};
    
    // Process compensation analysis
    reportData.compensation_analysis = await generateCompensationAnalysis(apiKey, content);
    
    // Process timeline expectations
    reportData.timeline_expectations = await generateTimelineExpectations(apiKey, content);
    
    // Process company description
    reportData.company_description = await generateCompanyDescription(apiKey, content);
    
    // Process job description enhancer
    reportData.job_description_enhancer = await generateJobDescriptionEnhancer(apiKey, content);
    
    // Process nice to have skills
    reportData.nice_to_have_skills = await generateNiceToHaveSkills(apiKey, content);
    
    // Process interview questions
    reportData.interview_questions = await generateInterviewQuestions(apiKey, content);
    
    // Process benefits description
    reportData.benefits_description = await generateBenefitsDescription(apiKey, content);
    
    // Process previous job titles
    reportData.previous_job_titles = await generatePreviousJobTitles(apiKey, content);
    
    // Process boolean search string
    reportData.boolean_search_string = await generateBooleanSearchString(apiKey, content);
    
    // Process talent locations
    reportData.talent_locations = await generateTalentLocations(apiKey, content);
    
    // Process job ad summary
    reportData.job_ad_summary = await generateJobAdSummary(apiKey, content);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: reportData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error generating Clarvida report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Gemini API helper function
async function callGeminiApi(apiKey: string, prompt: string, systemPrompt?: string) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2.0:generateContent";
  
  const fullUrl = `${url}?key=${apiKey}`;
  
  const body: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  };
  
  // Add system prompt if provided
  if (systemPrompt) {
    body.contents.unshift({
      role: "system",
      parts: [{ text: systemPrompt }]
    });
  }
  
  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  return result;
}

// Compensation Analysis
async function generateCompensationAnalysis(apiKey: string, content: string) {
  const systemPrompt = "You are an expert-level Compensation Analyst. You produce compensation analysis based on experience, industry, geography, and skillset. You cite your sources with real and accurate links. Provide information on benefits, bonuses, and other fringe benefits for the role.";
  
  const userPrompt = `Please provide a detailed compensation report for the following job description: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    // Extract the generated text
    const generatedText = result.candidates[0].content.parts[0].text;
    
    // Parse and structure the data
    // This is a simplified example - in a real implementation, you would need more robust parsing
    return {
      report: generatedText,
      salary_range: {
        min: extractSalaryMinimum(generatedText),
        max: extractSalaryMaximum(generatedText),
        average: extractSalaryAverage(generatedText)
      },
      benefits: extractBenefits(generatedText),
      bonuses: extractBonuses(generatedText),
      fringe_benefits: extractFringeBenefits(generatedText),
      sources: extractSources(generatedText)
    };
  } catch (error) {
    console.error("Error parsing compensation analysis:", error);
    return {
      report: "Unable to generate compensation analysis.",
      salary_range: { min: 0, max: 0, average: 0 },
      benefits: [],
      bonuses: [],
      fringe_benefits: [],
      sources: []
    };
  }
}

// Timeline Expectations
async function generateTimelineExpectations(apiKey: string, content: string) {
  const systemPrompt = "You are a direct reporting manager. Create a timeline of expectations for a new hire.";
  
  const userPrompt = `Create a timeline of expectations summarized in paragraphs for the following periods: 30 days, 60 days, 90 days, and 1 year. Base this on the following job description: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    // Extract sections for each time period
    return {
      "30_days": extractTimelinePeriod(generatedText, "30 days"),
      "60_days": extractTimelinePeriod(generatedText, "60 days"),
      "90_days": extractTimelinePeriod(generatedText, "90 days"),
      "1_year": extractTimelinePeriod(generatedText, "1 year")
    };
  } catch (error) {
    console.error("Error parsing timeline expectations:", error);
    return {
      "30_days": "Unable to generate 30-day expectations.",
      "60_days": "Unable to generate 60-day expectations.",
      "90_days": "Unable to generate 90-day expectations.",
      "1_year": "Unable to generate 1-year expectations."
    };
  }
}

// Company Description
async function generateCompanyDescription(apiKey: string, content: string) {
  const systemPrompt = "You are a marketing expert. Write a compelling paragraph about what it's like to work at a company.";
  
  const userPrompt = `Based on this job description, write a compelling paragraph about what it would be like to work at this company. Include comments about growth, culture, and focus on family: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error parsing company description:", error);
    return "Unable to generate company description.";
  }
}

// Job Description Enhancer
async function generateJobDescriptionEnhancer(apiKey: string, content: string) {
  const systemPrompt = "You are a multi-disciplinary Recruitment Marketing specialist in optimizing job descriptions to align with an employer's brand and attract top talent.";
  
  const userPrompt = `Analyze this job listing and provide specific, actionable optimization tips for improvement, focusing on clarity, inclusivity, and alignment with company mission: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return {
      optimization_tips: extractOptimizationTips(generatedText),
      revised_job_listing: extractRevisedJobListing(generatedText)
    };
  } catch (error) {
    console.error("Error parsing job description enhancer:", error);
    return {
      optimization_tips: ["Unable to generate optimization tips."],
      revised_job_listing: "Unable to generate revised job listing."
    };
  }
}

// Nice to Have Skills
async function generateNiceToHaveSkills(apiKey: string, content: string) {
  const systemPrompt = "You are a hiring manager and industry expert. Suggest supplemental qualifications and nice-to-have skills.";
  
  const userPrompt = `Based on this job description, suggest supplemental qualifications and nice-to-have skills. For each skill, provide a short explanation of why it's valuable: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return {
      supplemental_qualifications: extractSkillsWithReasoning(generatedText, "Supplemental Qualifications"),
      nice_to_have_skills: extractSkillsWithReasoning(generatedText, "Nice-to-Have Skills")
    };
  } catch (error) {
    console.error("Error parsing nice to have skills:", error);
    return {
      supplemental_qualifications: [],
      nice_to_have_skills: []
    };
  }
}

// Interview Questions
async function generateInterviewQuestions(apiKey: string, content: string) {
  const systemPrompt = "You are an excellent hiring manager and industry expert. Create open-ended interview questions.";
  
  const userPrompt = `Create 10 open-ended interview questions for this role. After each question, explain what competency you're trying to assess: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return extractInterviewQuestions(generatedText);
  } catch (error) {
    console.error("Error parsing interview questions:", error);
    return [];
  }
}

// Benefits Description
async function generateBenefitsDescription(apiKey: string, content: string) {
  const systemPrompt = "You are the Head of Total Rewards and Benefits. Write a compelling paragraph about benefits.";
  
  const userPrompt = `Extract likely benefits from this job description, then write a compelling paragraph describing those benefits: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    return {
      benefits_paragraph: result.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error("Error parsing benefits description:", error);
    return {
      benefits_paragraph: "Unable to generate benefits description."
    };
  }
}

// Previous Job Titles
async function generatePreviousJobTitles(apiKey: string, content: string) {
  const systemPrompt = "You are an expert recruiter. List job titles previously held by ideal candidates.";
  
  const userPrompt = `List at least five job titles previously held by an ideal candidate for this role: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return extractListItems(generatedText);
  } catch (error) {
    console.error("Error parsing previous job titles:", error);
    return [];
  }
}

// Boolean Search String
async function generateBooleanSearchString(apiKey: string, content: string) {
  const systemPrompt = "You are an expert at Boolean search strings for sourcing candidates.";
  
  const userPrompt = `Create a LinkedIn Boolean search string to find candidates for this role. Include relevant skills and job titles: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    return {
      boolean_string: result.candidates[0].content.parts[0].text.trim()
    };
  } catch (error) {
    console.error("Error parsing boolean search string:", error);
    return {
      boolean_string: "Unable to generate Boolean search string."
    };
  }
}

// Talent Locations
async function generateTalentLocations(apiKey: string, content: string) {
  const systemPrompt = "You are a candidate headhunter. Identify locations with trends of relevant talent.";
  
  const userPrompt = `Based on this job description, identify:
1. Locations that are seeing a trend of talent for this role
2. Locations where someone with these skills might be based
3. Communities or networking groups that would cater to these types of professionals

Job description: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return {
      trending_talent_locations: extractLocationList(generatedText, "trend"),
      skill_based_locations: extractLocationList(generatedText, "skills"),
      recommended_communities: extractLocationList(generatedText, "communities")
    };
  } catch (error) {
    console.error("Error parsing talent locations:", error);
    return {
      trending_talent_locations: [],
      skill_based_locations: [],
      recommended_communities: []
    };
  }
}

// Job Ad Summary
async function generateJobAdSummary(apiKey: string, content: string) {
  const systemPrompt = "You are an expert job ad analyst and labor scientist.";
  
  const userPrompt = `Summarize the following job description into two engaging paragraphs and highlight the most important required skills. Separate the skills into Hard Skills and Soft Skills: ${content}`;
  
  const result = await callGeminiApi(apiKey, userPrompt, systemPrompt);
  
  try {
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return {
      summary_paragraphs: extractSummaryParagraphs(generatedText),
      hard_skills: extractSkillsList(generatedText, "Hard Skills"),
      soft_skills: extractSkillsList(generatedText, "Soft Skills"),
      boolean_string: extractBooleanStringFromSummary(generatedText)
    };
  } catch (error) {
    console.error("Error parsing job ad summary:", error);
    return {
      summary_paragraphs: ["Unable to generate summary paragraphs."],
      hard_skills: [],
      soft_skills: [],
      boolean_string: ""
    };
  }
}

// Helper functions for extracting data from generated text
function extractSalaryMinimum(text: string): number {
  try {
    // Simple regex to find salary ranges
    const match = text.match(/\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*-\s*\$(\d{1,3}(,\d{3})*(\.\d+)?)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function extractSalaryMaximum(text: string): number {
  try {
    // Simple regex to find salary ranges
    const match = text.match(/\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*-\s*\$(\d{1,3}(,\d{3})*(\.\d+)?)/);
    if (match) {
      return parseInt(match[4].replace(/,/g, ''));
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function extractSalaryAverage(text: string): number {
  try {
    // First check if there's an explicit average mentioned
    const averageMatch = text.match(/average\s*(?:salary|compensation)?\s*(?:is|of)?\s*\$(\d{1,3}(,\d{3})*(\.\d+)?)/i);
    if (averageMatch) {
      return parseInt(averageMatch[1].replace(/,/g, ''));
    }
    
    // If not, calculate from min and max
    const min = extractSalaryMinimum(text);
    const max = extractSalaryMaximum(text);
    
    if (min > 0 && max > 0) {
      return Math.round((min + max) / 2);
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
}

function extractBenefits(text: string): string[] {
  try {
    // Look for a benefits section
    const benefitsSection = text.match(/benefits(?:\s*include|\s*offered|\s*provided)?:?([^]*?)(?:bonus|source|reference|salary|##|$)/i);
    
    if (benefitsSection) {
      // Extract bullet points or lines
      const benefits = benefitsSection[1]
        .split(/\n/)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(line => line.length > 0 && !line.match(/^(salary|compensation|pay|range|average)/i));
      
      return benefits.slice(0, 10); // Limit to 10 items
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

function extractBonuses(text: string): string[] {
  try {
    // Look for bonus mentions
    const bonusSection = text.match(/bonus(?:es)?(?:\s*include|\s*offered|\s*provided)?:?([^]*?)(?:benefit|source|reference|##|$)/i);
    
    if (bonusSection) {
      // Extract bullet points or lines
      const bonuses = bonusSection[1]
        .split(/\n/)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(line => line.length > 0 && !line.match(/^(salary|compensation|pay|range|average)/i));
      
      return bonuses.slice(0, 5); // Limit to 5 items
    }
    
    // If no dedicated section, look for bonus mentions throughout the text
    const bonusMentions = text.match(/(?:annual bonus|sign-on bonus|performance bonus|equity bonus|stock options)[^.;!?]*[.;!?]/gi);
    
    if (bonusMentions) {
      return [...new Set(bonusMentions.map(line => line.trim()))].slice(0, 5);
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

function extractFringeBenefits(text: string): string[] {
  try {
    const fringeBenefits = [];
    
    // Look for specific fringe benefits
    const patterns = [
      /(?:free|complimentary)\s+[^.;!?]*[.;!?]/gi,
      /(?:work from home|remote work|flexible schedule|flexible hours)[^.;!?]*[.;!?]/gi,
      /(?:training|professional development|education|tuition)[^.;!?]*(?:reimbursement|assistance|support)[^.;!?]*[.;!?]/gi,
      /(?:wellness|gym|fitness)[^.;!?]*(?:program|membership|stipend)[^.;!?]*[.;!?]/gi,
      /(?:snacks|meals|lunch|breakfast)[^.;!?]*(?:provided|free|catered)[^.;!?]*[.;!?]/gi,
      /(?:commuter|transportation|parking)[^.;!?]*(?:benefit|allowance|reimbursement)[^.;!?]*[.;!?]/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        fringeBenefits.push(...matches.map(match => match.trim()));
      }
    });
    
    return [...new Set(fringeBenefits)].slice(0, 7); // Limit to 7 unique items
  } catch (error) {
    return [];
  }
}

function extractSources(text: string): { source_name: string; url: string }[] {
  try {
    // Look for sources section
    const sourcesSection = text.match(/(?:source|reference)s?:?([^]*?)(?:##|$)/i);
    
    if (sourcesSection) {
      const sources = sourcesSection[1]
        .split(/\n/)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(line => line.length > 0);
      
      // Extract name and URL from each source line
      return sources.map(source => {
        // Try to find a URL
        const urlMatch = source.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';
        
        // Extract the source name (everything before the URL or the whole line if no URL)
        let sourceName = url ? source.substring(0, source.indexOf(url)).trim() : source;
        
        // Remove trailing punctuation from the source name
        sourceName = sourceName.replace(/[.:,;]$/, '').trim();
        
        // If source name is empty but we have a URL, use the domain as the source name
        if (!sourceName && url) {
          try {
            sourceName = new URL(url).hostname.replace(/^www\./, '');
          } catch (e) {
            sourceName = "Reference";
          }
        }
        
        return { source_name: sourceName || "Reference", url: url || "#" };
      }).filter(source => source.source_name.length > 0);
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

function extractTimelinePeriod(text: string, period: string): string {
  try {
    // Look for the specific period heading and extract the paragraph that follows
    const regex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*${period}\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*(?:\\d+\\s*days|\\d+\\s*year)|$)`, 'i');
    
    const match = text.match(regex);
    if (match) {
      // Clean up the extracted text
      return match[1].trim().replace(/^[•\-*]\s*/gm, '').replace(/\n+/g, ' ');
    }
    
    // If no match using headings, try to find a paragraph that starts with the period
    const paragraphRegex = new RegExp(`(?:^|\\n)(?:At|After|In|Within)?\\s*${period}[^.]*\\.[^]*?(?=\\n\\n|$)`, 'i');
    const paragraphMatch = text.match(paragraphRegex);
    
    if (paragraphMatch) {
      return paragraphMatch[0].trim().replace(/^[•\-*]\s*/gm, '').replace(/\n+/g, ' ');
    }
    
    return `No specific expectations found for ${period}.`;
  } catch (error) {
    return `Error extracting expectations for ${period}.`;
  }
}

function extractOptimizationTips(text: string): string[] {
  try {
    // Look for a numbered list or bullet points with optimization tips
    const tipsSection = text.match(/(?:optimization tips|tips for improvement|suggested improvements)(?:[:\s]*)([^]*?)(?:(?:##|revised job|$))/i);
    
    if (tipsSection) {
      // Extract numbered items or bullet points
      const tips = tipsSection[1]
        .split(/\n/)
        .map(line => line.trim().replace(/^[\d.•\-*)\s]+/, ''))
        .filter(line => line.length > 10); // Filter out very short lines or headings
      
      return tips.slice(0, 10); // Limit to 10 tips
    }
    
    return ["Focus on inclusive language", "Highlight company culture", "Specify clear requirements", "Add salary range information"];
  } catch (error) {
    return ["Error extracting optimization tips."];
  }
}

function extractRevisedJobListing(text: string): any {
  try {
    // Look for the revised job listing section
    const listingSection = text.match(/(?:revised job listing|enhanced job description)(?:[:\s]*)([^]*?)(?:$)/i);
    
    if (listingSection) {
      const listingText = listingSection[1].trim();
      
      // Try to parse structure - this is very basic and would need to be improved
      const jobTitle = extractSectionFromJobListing(listingText, "job title|position|role");
      const companyOverview = extractSectionFromJobListing(listingText, "company overview|about.*company|about us");
      const aboutRole = extractSectionFromJobListing(listingText, "about.*role|role overview|position description");
      const responsibilities = extractListItemsFromJobListing(listingText, "responsibilities|duties|what you'll do|day-to-day");
      const requirements = extractListItemsFromJobListing(listingText, "requirements|qualifications|what you'll need|what we're looking for");
      const benefits = extractListItemsFromJobListing(listingText, "benefits|what we offer|perks|compensation");
      const equalOpportunity = extractSectionFromJobListing(listingText, "equal opportunity|diversity|inclusion|eeo");
      
      return {
        job_title: jobTitle || "Position Title",
        company_overview: companyOverview || "Company Overview",
        about_this_role: aboutRole ? [aboutRole] : responsibilities.slice(0, 3),
        perks_of_this_role: benefits.length > 0 ? benefits : ["Competitive salary", "Great benefits", "Work-life balance"],
        what_we_are_looking_for: requirements.length > 0 ? requirements : ["Relevant experience", "Technical skills", "Communication abilities"],
        preferred_education: extractEducationRequirements(listingText),
        what_we_offer: benefits.length > 0 ? benefits : ["Competitive salary", "Health insurance", "Professional development"],
        equal_opportunity_statement: equalOpportunity || "We are an equal opportunity employer and value diversity.",
        apply_link: "#",
        apply_link_text: "Apply Now"
      };
    }
    
    return {
      job_title: "Job Title",
      company_overview: "Company overview not available.",
      about_this_role: ["Role information not available."],
      perks_of_this_role: ["Benefits information not available."],
      what_we_are_looking_for: ["Requirements information not available."],
      preferred_education: ["Education requirements not specified."],
      what_we_offer: ["Benefits package not specified."],
      equal_opportunity_statement: "We are an equal opportunity employer.",
      apply_link: "#",
      apply_link_text: "Apply Now"
    };
  } catch (error) {
    console.error("Error parsing revised job listing:", error);
    return {
      job_title: "Job Title",
      company_overview: "Error extracting company information.",
      about_this_role: ["Error extracting role information."],
      perks_of_this_role: ["Error extracting perks information."],
      what_we_are_looking_for: ["Error extracting requirements information."],
      preferred_education: ["Error extracting education requirements."],
      what_we_offer: ["Error extracting benefits information."],
      equal_opportunity_statement: "We are an equal opportunity employer.",
      apply_link: "#",
      apply_link_text: "Apply Now"
    };
  }
}

function extractSectionFromJobListing(text: string, sectionPattern: string): string {
  const regex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*(${sectionPattern})\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*\\w+|$)`, 'i');
  const match = text.match(regex);
  
  if (match) {
    return match[2].trim().replace(/^[•\-*]\s*/gm, '').replace(/\n+/g, ' ');
  }
  
  return "";
}

function extractListItemsFromJobListing(text: string, sectionPattern: string): string[] {
  const regex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*(${sectionPattern})\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*\\w+|$)`, 'i');
  const match = text.match(regex);
  
  if (match) {
    return match[2]
      .split(/\n/)
      .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
      .filter(line => line.length > 5);
  }
  
  return [];
}

function extractEducationRequirements(text: string): string[] {
  // Look for education requirements in the text
  const educationRegex = /(?:education|degree|qualification)s?[^.]*(?:required|preferred|needed)[^.]*/gi;
  const educationMatches = text.match(educationRegex);
  
  if (educationMatches && educationMatches.length > 0) {
    return educationMatches.map(match => match.trim());
  }
  
  // If no specific education statements found, look for degree mentions
  const degreeRegex = /(?:bachelor'?s?|master'?s?|phd|doctoral|associate'?s?|mba)[^.]*degree[^.]*/gi;
  const degreeMatches = text.match(degreeRegex);
  
  if (degreeMatches && degreeMatches.length > 0) {
    return degreeMatches.map(match => match.trim());
  }
  
  return ["Relevant education or equivalent experience preferred."];
}

function extractSkillsWithReasoning(text: string, sectionName: string): { skill: string; reasoning: string }[] {
  try {
    // Look for the specific section
    const sectionRegex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*${sectionName}\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*\\w+|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);
    
    if (!sectionMatch) return [];
    
    const sectionText = sectionMatch[1];
    
    // Look for patterns like "1. Skill: Reasoning" or "• Skill - Reasoning"
    const lines = sectionText.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.map(line => {
      // Remove numbering or bullets
      const cleanLine = line.replace(/^[\d.•\-*)\s]+/, '');
      
      // Try to split skill from reasoning using common separators
      const separators = [': ', ' - ', ' – ', ': ', ':\n', ' — '];
      
      for (const separator of separators) {
        if (cleanLine.includes(separator)) {
          const [skill, reasoning] = cleanLine.split(separator, 2);
          return { skill: skill.trim(), reasoning: reasoning.trim() };
        }
      }
      
      // If no separator found, use the whole line as the skill
      return { skill: cleanLine, reasoning: "Important for the role." };
    });
  } catch (error) {
    console.error("Error parsing skills with reasoning:", error);
    return [];
  }
}

function extractInterviewQuestions(text: string): { number: number; question: string; competency_assessed: string }[] {
  try {
    // Split by numbered items
    const questionRegex = /(?:^|\n)\s*(\d+)[.)\s]+([^]*?)(?=\n\s*\d+[.)\s]+|$)/g;
    const matches = [...text.matchAll(questionRegex)];
    
    if (matches.length === 0) return [];
    
    return matches.map((match, index) => {
      const number = parseInt(match[1]) || index + 1;
      const content = match[2].trim();
      
      // Try to split the question from the competency assessment
      const separators = ['\nCompetency:', '\nCompetency assessed:', '\nThis assesses:', '\nThis question assesses:'];
      
      for (const separator of separators) {
        if (content.includes(separator)) {
          const [question, competency] = content.split(separator, 2);
          return { number, question: question.trim(), competency_assessed: competency.trim() };
        }
      }
      
      // Look for patterns like "Question: ... Competency: ..."
      const competencyPattern = /(?:competency|skill|assessment):\s*([^]*?)$/i;
      const competencyMatch = content.match(competencyPattern);
      
      if (competencyMatch) {
        const question = content.substring(0, content.indexOf(competencyMatch[0])).trim();
        return { number, question, competency_assessed: competencyMatch[1].trim() };
      }
      
      return { number, question: content, competency_assessed: "Not specified" };
    });
  } catch (error) {
    console.error("Error parsing interview questions:", error);
    return [];
  }
}

function extractListItems(text: string): string[] {
  try {
    // Extract numbered or bulleted items
    const lines = text.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    return lines
      .map(line => line.replace(/^[\d.•\-*)\s]+/, '').trim())
      .filter(line => line.length > 0 && !line.match(/^(previous job titles|job titles|titles|here are)/i))
      .slice(0, 10); // Limit to 10 items
  } catch (error) {
    console.error("Error extracting list items:", error);
    return [];
  }
}

function extractLocationList(text: string, type: string): string[] {
  try {
    let sectionPattern = "";
    
    switch (type) {
      case "trend":
        sectionPattern = "trending talent locations|locations seeing a trend|locations with talent trend";
        break;
      case "skills":
        sectionPattern = "skill[- ]based locations|locations.*skills|where.*skills.*based";
        break;
      case "communities":
        sectionPattern = "communities|networking groups|professional groups|recommended groups";
        break;
    }
    
    const sectionRegex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*(${sectionPattern})\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*\\w+|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);
    
    if (sectionMatch) {
      const sectionText = sectionMatch[2];
      
      return sectionText
        .split(/\n/)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(line => line.length > 0)
        .slice(0, 10); // Limit to 10 locations
    }
    
    return [];
  } catch (error) {
    console.error(`Error extracting ${type} locations:`, error);
    return [];
  }
}

function extractSummaryParagraphs(text: string): string[] {
  try {
    // Look for the summary paragraphs at the beginning, before the skills sections
    const summaryMatch = text.match(/^([^]*?)(?:hard skills|soft skills|skills breakdown|##|===|\*\*)/is);
    
    if (summaryMatch) {
      const summaryText = summaryMatch[1].trim();
      
      // Split into paragraphs
      const paragraphs = summaryText
        .split(/\n\n+/)
        .map(p => p.trim().replace(/\n/g, ' '))
        .filter(p => p.length > 50); // Only include substantial paragraphs
      
      return paragraphs.slice(0, 2); // Limit to 2 paragraphs
    }
    
    return ["Summary not available."];
  } catch (error) {
    console.error("Error extracting summary paragraphs:", error);
    return ["Error extracting summary."];
  }
}

function extractSkillsList(text: string, skillType: string): string[] {
  try {
    // Look for the skills section
    const skillsRegex = new RegExp(`(?:##|\\*\\*|===|\\n)\\s*${skillType}\\s*(?:##|\\*\\*|===|:|\\n)\\s*([^]*?)(?:(?:##|\\*\\*|===|\\n)\\s*\\w+|$)`, 'i');
    const skillsMatch = text.match(skillsRegex);
    
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      
      return skillsText
        .split(/\n/)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(line => line.length > 0)
        .slice(0, 10); // Limit to 10 skills
    }
    
    return [];
  } catch (error) {
    console.error(`Error extracting ${skillType}:`, error);
    return [];
  }
}

function extractBooleanStringFromSummary(text: string): string {
  try {
    // Look for a boolean string section
    const booleanRegex = /(?:boolean string|search string|boolean search)(?:[:\s]*)([^]*?)(?:$)/i;
    const booleanMatch = text.match(booleanRegex);
    
    if (booleanMatch) {
      return booleanMatch[1].trim();
    }
    
    return "";
  } catch (error) {
    console.error("Error extracting boolean string from summary:", error);
    return "";
  }
}
