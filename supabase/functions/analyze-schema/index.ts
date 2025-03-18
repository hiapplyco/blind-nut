
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

interface JobAnalysisRequest {
  schema: string;
}

interface ExtractedData {
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
}

interface JobAnalysisResponse {
  extractedData: ExtractedData;
  analysis: {
    marketInsights: string;
    compensationAnalysis: string;
    skillsEvaluation: string;
    recommendations: string[];
  };
}

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema } = await req.json() as JobAnalysisRequest;
    
    if (!schema?.trim()) {
      throw new Error("Job posting content is required");
    }

    console.log("Analyzing job posting:", schema);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    // Construct a more detailed prompt to help Gemini generate valid JSON
    const prompt = `
You are a job posting analyzer. Your task is to extract information from the given job posting and return a valid JSON object.

Given this job posting:
${schema}

Analyze it and respond with a JSON object only, no other text. The JSON must exactly match this structure:
{
  "extractedData": {
    "title": "infer title if not explicitly stated",
    "client": "unknown if not stated",
    "location": "remote if not stated",
    "salaryRange": {
      "min": 0,
      "max": 0
    },
    "jobType": "full-time if not stated",
    "experienceLevel": "not specified if not stated",
    "skills": ["include any mentioned skills"],
    "applicationDeadline": "2024-12-31 if not stated",
    "remoteAllowed": false,
    "description": "full job description or input text if no clear description"
  },
  "analysis": {
    "marketInsights": "1-2 sentences about market context",
    "compensationAnalysis": "1-2 sentences about compensation if mentioned",
    "skillsEvaluation": "1-2 sentences about required skills",
    "recommendations": [
      "one recommendation for improvement",
      "another recommendation if needed"
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    let analysisContent = result.response.text();
    console.log("Raw Gemini response:", analysisContent);

    // Clean up the response to ensure valid JSON
    analysisContent = analysisContent.trim();
    if (analysisContent.startsWith("```json")) {
      analysisContent = analysisContent.replace(/```json\n?/, "").replace(/```$/, "");
    }
    analysisContent = analysisContent.trim();

    try {
      const analysisData = JSON.parse(analysisContent) as JobAnalysisResponse;
      console.log("Successfully parsed analysis data");
      
      return new Response(JSON.stringify(analysisData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", parseError);
      console.log("Invalid JSON content:", analysisContent);
      throw new Error("Failed to parse Gemini response as valid JSON");
    }
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

