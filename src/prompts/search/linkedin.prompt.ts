import { PromptTemplate } from '../types';

export const linkedinSearchPrompt: PromptTemplate = {
  name: "LinkedIn X-Ray Search",
  version: "1.0.0",
  description: "Generates optimized LinkedIn X-Ray search strings",
  parameters: ["content", "searchType", "companyName", "metroArea"],
  template: `{{#if searchType === 'companies'}}
Create a targeted LinkedIn X-Ray search string to find similar companies. Follow these rules:

1. Analyze the company description and extract:
   - Industry and sector
   - Company specializations (2-3 key areas)
   - Company size indicators
   - Key technologies or services

2. Format the search string exactly like this:
site:linkedin.com/company {{#if metroArea}}"{{metroArea}}" AND {{/if}}("INDUSTRY_1" OR "INDUSTRY_2") AND ("SPECIALIZATION_1" OR "SPECIALIZATION_2")

Rules:
- Replace placeholders with actual values
- Use proper capitalization
- Include quotes around exact phrases
- Group similar terms with OR
- Connect different term types with AND
- No exclusions or NOT operators
- Keep terms specific and technical (no soft skills)
- If company name is provided, exclude it with -"{{companyName}}"

Company Description: {{content}}
{{else if searchType === 'candidates-at-company'}}
Create a targeted LinkedIn X-Ray search string to find candidates at a specific company. Follow these rules:

1. Extract 3-6 concrete, technical skills or qualifications from the job description (no soft skills)
2. Format the search string exactly like this:
site:linkedin.com/in/ "{{companyName}}" {{#if metroArea}}AND "{{metroArea}}" {{/if}}AND ("SKILL_1" OR "SKILL_2") AND ("SKILL_3" OR "SKILL_4")

Rules:
- Replace SKILL placeholders with actual technical skills from the job description
- Use proper capitalization
- Include quotes around exact phrases
- Group similar skills with OR
- Connect different term types with AND
- No exclusions or NOT operators
- Keep skills specific and technical (no soft skills)

Job Description: {{content}}
{{else}}
Create a targeted LinkedIn X-Ray search string for this job description. Follow these rules:

1. Extract 2-4 relevant job titles that are specific to this role
2. Extract 3-6 concrete, technical skills or qualifications (no soft skills)
3. DO NOT include any "NOT" operators or exclusions
4. Format the search string exactly like this:

site:linkedin.com/in/ {{#if companyName}}"{{companyName}}" AND {{/if}}{{#if metroArea}}"{{metroArea}}" AND {{/if}}("JOB_TITLE_1" OR "JOB_TITLE_2") AND ("SKILL_1" OR "SKILL_2") AND ("SKILL_3" OR "SKILL_4")

Rules:
- Replace placeholders with actual values
- Use proper capitalization
- Include quotes around exact phrases
- Group similar terms with OR
- Connect different term types with AND
- No exclusions or NOT operators
- Keep skills specific and technical (no soft skills)

Job Description: {{content}}
{{/if}}`
};