
import { PromptTemplate } from './types.ts';

export const defaultPrompt: PromptTemplate = {
  name: 'default-job-analysis',
  version: '1.0.0',
  description: 'Standard job analysis prompt',
  template: `Analyze the following job description and provide key insights:

{{content}}

Based on this job description, generate a boolean search string that can be used to find qualified candidates on LinkedIn. Make sure to:
1. Include the most important skills and experience requirements
2. Combine terms with AND and OR operators appropriately
3. Group related terms with parentheses
4. Use quotation marks for exact phrases
5. Include "site:linkedin.com/in/" in the search string to limit results to LinkedIn profiles

Return your analysis as JSON in the following format:
{
  "terms": {
    "skills": ["string"],
    "titles": ["string"],
    "keywords": ["string"]
  },
  "salary": {
    "min": number,
    "max": number,
    "currency": "string"
  },
  "location": "string",
  "company": "string",
  "job_title": "string",
  "experience_level": "string",
  "employment_type": "string",
  "searchString": "string" (Your generated boolean search string for candidate sourcing)
}`,
  parameters: ['content'],
};
