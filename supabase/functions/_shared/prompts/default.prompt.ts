
import { PromptTemplate } from './types.ts';

export const defaultPrompt: PromptTemplate = {
  name: 'default-job-analysis',
  version: '1.0.0',
  description: 'Standard job analysis prompt',
  template: `Analyze the following job description and provide key insights:

{{content}}

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
  "employment_type": "string"
}`,
  parameters: ['content'],
};
