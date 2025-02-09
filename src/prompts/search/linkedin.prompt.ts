
import { PromptTemplate } from '../types';

export const linkedinSearchPrompt: PromptTemplate = {
  name: "LinkedIn X-Ray Search",
  version: "1.0.0",
  description: "Generates optimized LinkedIn X-Ray search strings",
  parameters: ["content", "searchType", "companyName", "metroArea"],
  template: `{{#if searchType === 'companies'}}
Create a targeted search string to find similar companies. Follow these rules:

1. Analyze the company description and extract key identifying information:
   - Industry and sector keywords
   - Business type and model
   - Company focus areas
   - Target market or audience
   - Technologies or services offered

2. Format the search string exactly like this:
site:linkedin.com/company/ {{#if metroArea}}"{{metroArea}}" AND {{/if}}("INDUSTRY_TERMS") AND ("BUSINESS_TYPE") AND ("FOCUS_AREA")

Rules:
- Replace placeholders with actual terms
- Use proper capitalization
- Include quotes around multi-word terms
- Group similar terms with OR
- Connect different groups with AND
- If company name provided, exclude it with -"{{companyName}}"
- Keep terms relevant and specific

Company Description: {{content}}
{{else if searchType === 'candidates-at-company'}}
Create a targeted LinkedIn X-Ray search string to find candidates at a specific company. Follow these rules:

1. Extract from the job description:
   - Professional roles and positions
   - Skills and expertise areas
   - Industry experience
   - Professional qualifications
   - Department or team indicators

2. Format the search string exactly like this:
site:linkedin.com/in/ "{{companyName}}" {{#if metroArea}}AND "{{metroArea}}" {{/if}}AND ("ROLE_1" OR "ROLE_2") AND ("EXPERTISE_1" OR "EXPERTISE_2")

Rules:
- Extract relevant professional terms
- Use proper capitalization
- Include quotes around multi-word terms
- Group similar terms with OR
- Connect different groups with AND
- Focus on professional qualifications and roles
- Make terms specific to the industry

Job Description: {{content}}
{{else}}
Create a targeted LinkedIn X-Ray search string for finding candidates. Follow these rules:

1. Extract from the description:
   - Relevant job titles and roles
   - Professional skills and qualifications
   - Industry experience areas
   - Department or functional areas
   - Professional certifications or credentials

2. Format the search string exactly like this:
site:linkedin.com/in/ {{#if companyName}}"{{companyName}}" AND {{/if}}{{#if metroArea}}"{{metroArea}}" AND {{/if}}("ROLE_1" OR "ROLE_2") AND ("SKILL_1" OR "SKILL_2") AND ("INDUSTRY_1" OR "INDUSTRY_2")

Rules:
- Extract relevant professional terms
- Group similar terms with OR
- Use proper capitalization
- Include quotes around multi-word terms
- Connect different groups with AND
- Keep terms relevant to the profession
- Focus on role-specific qualifications

Description: {{content}}
{{/if}}`
};
