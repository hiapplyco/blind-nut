
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

    // Call Gemini API using gemini-flash-2.0 model
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2.0:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional talent acquisition and career coaching AI. Analyze the following job description and provide detailed insights in JSON format:

${content}

Your analysis should include detailed information on these topics:
1. Compensation analysis with salary ranges and benefits
2. Timeline expectations at 30, 60, 90 days and 1 year
3. Company description
4. Job description enhancement suggestions with optimization tips
5. Nice-to-have skills with reasoning
6. Interview questions with competency assessment
7. Benefits description
8. Previous job titles for ideal candidates
9. Boolean search string for candidate sourcing
10. Talent locations with trending areas
11. Job ad summary with key skills

Return ONLY JSON data in this exact structure:
{
  "compensation_analysis": {
    "report": "string",
    "salary_range": {
      "min": number,
      "max": number,
      "average": number
    },
    "benefits": ["string"],
    "bonuses": ["string"],
    "fringe_benefits": ["string"],
    "sources": [
      {
        "source_name": "string",
        "url": "string"
      }
    ]
  },
  "timeline_expectations": {
    "30_days": "string",
    "60_days": "string",
    "90_days": "string",
    "1_year": "string"
  },
  "company_description": "string",
  "job_description_enhancer": {
    "optimization_tips": ["string"],
    "revised_job_listing": "string"
  },
  "nice_to_have_skills": {
    "supplemental_qualifications": [
      {
        "skill": "string",
        "reasoning": "string"
      }
    ],
    "nice_to_have_skills": [
      {
        "skill": "string",
        "reasoning": "string"
      }
    ]
  },
  "interview_questions": [
    {
      "number": number,
      "question": "string",
      "competency_assessed": "string"
    }
  ],
  "benefits_description": {
    "benefits_paragraph": "string"
  },
  "previous_job_titles": ["string"],
  "boolean_search_string": {
    "boolean_string": "string"
  },
  "talent_locations": {
    "trending_talent_locations": ["string"],
    "skill_based_locations": ["string"],
    "recommended_communities": ["string"]
  },
  "job_ad_summary": {
    "summary_paragraphs": ["string"],
    "hard_skills": ["string"],
    "soft_skills": ["string"],
    "boolean_string": "string"
  }
}`
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Received response from Gemini API');
    
    // Extract the JSON data from the text response
    let reportData;
    try {
      const textContent = result.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text - look for objects between curly braces
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from Gemini response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse Gemini response: ' + parseError.message);
    }
    
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
