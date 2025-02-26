
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

interface JobAnalysisRequest {
  schema: string; // Raw job posting text
}

interface JobAnalysisResponse {
  extractedData: {
    title: string;
    client: string;
    location: string;
    salaryRange: {
      min: number;
      max: number;
    };
    jobType: string;
    experienceLevel: string;
    skills: string[];
    applicationDeadline: string;
    remoteAllowed: boolean;
    description: string;
  };
  analysis: {
    marketInsights: string;
    compensationAnalysis: string;
    skillsEvaluation: string;
    recommendations: string[];
  };
}

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema } = await req.json() as JobAnalysisRequest;
    
    // Initialize Google Gemini AI with the correct model
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for job analysis
    const prompt = `
Analyze this job posting and extract structured data along with insights. Return the results as a single JSON object with the following structure:

{
  "extractedData": {
    "title": "job title",
    "client": "company name",
    "location": "job location",
    "salaryRange": {
      "min": minimum salary (number),
      "max": maximum salary (number)
    },
    "jobType": "employment type",
    "experienceLevel": "required experience level",
    "skills": ["list", "of", "required", "skills"],
    "applicationDeadline": "YYYY-MM-DD deadline date",
    "remoteAllowed": boolean indicating if remote work is allowed,
    "description": "job description"
  },
  "analysis": {
    "marketInsights": "paragraph analyzing how this position compares to market trends",
    "compensationAnalysis": "paragraph evaluating if the compensation is competitive",
    "skillsEvaluation": "paragraph discussing the required skills and their relevance",
    "recommendations": [
      "1-3 recommendations for improving the job posting"
    ]
  }
}

Important:
- Extract all available information from the job posting
- Provide detailed analysis in each section
- Format dates as YYYY-MM-DD
- Ensure all fields are properly typed (numbers for salary, array for skills, etc.)
- If any field is missing, make a reasonable inference but note this in the analysis

Here's the job posting to analyze:
${schema}
`;

    // Generate analysis using Gemini
    const result = await model.generateContent(prompt);
    const analysisContent = result.response.text();
    
    // Parse and validate the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisContent);
    } catch (parseError) {
      throw new Error("Failed to parse Gemini output as valid JSON");
    }
    
    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-schema function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to analyze job posting" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(handleRequest);
