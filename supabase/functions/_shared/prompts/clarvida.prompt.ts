
import { PromptTemplate } from './types.ts';

export const clarvidaPrompt: PromptTemplate = {
  name: 'clarvida-job-analysis',
  version: '1.0.0',
  description: 'A comprehensive talent acquisition and career coaching prompt for job analysis',
  template: `You are a professional talent acquisition and career coaching AI. Analyze the following job description and provide detailed insights in JSON format:

{{content}}

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
}`,
  parameters: ['content'],
};
