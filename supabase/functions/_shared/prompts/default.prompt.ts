
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
{{#if searchType === 'candidates-at-company'}}
6. Include the company name "{{companyName}}" in the search string
{{/if}}

You MUST return your analysis as a valid JSON object in the following format exactly:
{
  "terms": {
    "skills": ["skill1", "skill2", "skill3"],
    "titles": ["title1", "title2"],
    "keywords": ["keyword1", "keyword2"]
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
  "searchString": "YOUR GENERATED BOOLEAN SEARCH STRING"
}

The searchString field is CRITICAL and must contain a complete, valid boolean search string with proper syntax for LinkedIn X-Ray searches.`,
  parameters: ['content', 'searchType', 'companyName'],
};
