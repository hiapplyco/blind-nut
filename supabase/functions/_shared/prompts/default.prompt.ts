
import { PromptTemplate } from './types.ts';

export const defaultPrompt: PromptTemplate = {
  name: "Default Prompt",
  version: "1.0",
  description: "Default prompt for processing job requirements and generating search strings",
  template: `
You are an expert recruiting assistant. Your task is to analyze {{content}} and provide insights that will help in the recruiting process.

Requirements:
1. Analyze the requirements carefully
2. Identify key skills and technologies required
3. Suggest job titles that match these requirements
4. Create a search string optimized for search engines to find relevant candidates
5. Identify keywords for search optimization

Provide your analysis in a structured JSON format with the following sections:
- job_summary: A concise summary of the job
- enhanced_description: An enhanced version of the description
- search_string: A Google search string to find candidates with these skills and experience
- compensation_analysis: Analysis of appropriate compensation if applicable
- terms: { skills: [], titles: [], keywords: [] }
  `,
  parameters: ["content"]
};
