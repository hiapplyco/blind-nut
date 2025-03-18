
import { PromptTemplate } from './types.ts';

export const clarvidaPrompt: PromptTemplate = {
  name: 'clarvida-job-analysis',
  version: '2.0.1', // Version bump for boolean search improvement
  description: 'A comprehensive and in-depth talent acquisition and career coaching prompt for rich job analysis.',
  template: `You are an expert professional talent acquisition and career coaching AI, renowned for your thorough and insightful analyses. Analyze the following job description and provide exceptionally detailed insights in JSON format.  Your goal is to generate rich, actionable information for talent acquisition and candidate coaching cards.

{{content}}

Your analysis MUST include comprehensive and detailed information on ALL of these topics, going beyond surface-level observations:

1. **Compensation Analysis with Deep Market Research:**
   - Generate an in-depth compensation analysis report.
   - Provide realistic salary ranges (min, max, average) based on thorough market research for the role and location.
   - Detail specific benefits packages commonly offered for similar roles, including health, retirement, and perks.
   - List typical bonuses and incentive structures applicable to this position.
   - Describe any fringe benefits that would be attractive to candidates.
   - Include at least 3 reputable sources with source names and URLs to back up your compensation data.

2. **Detailed Timeline Expectations (30, 60, 90 Days & 1 Year):**
   - Outline very specific and actionable expectations for a new hire at 30, 60, 90 days, and 1 year milestones.
   - For each timeline, detail key objectives, expected contributions, and performance indicators.  Think in terms of concrete tasks and achievements.

3. **In-Depth Company Description:**
   - Create a compelling and detailed company description that goes beyond basic facts.
   - Include information about company culture, values, mission, recent achievements, market position, growth potential, and employee value proposition.
   - Aim to create a description that would excite potential candidates about the company.

4. **Enhanced Job Description with Actionable Optimization Tips:**
   - Provide concrete and actionable optimization tips to improve the job description's clarity, attractiveness, and SEO effectiveness.
   - Present a fully revised job listing incorporating your optimization tips.  This revised listing should be significantly more compelling and informative than the original.

5. **Extensive List of Nice-to-Have Skills with Justification:**
   - Identify a comprehensive list of "nice-to-have" skills that would further enhance a candidate's profile for this role.
   - For EACH "nice-to-have" skill, provide detailed reasoning explaining why it would be beneficial and how it would add value in the context of this job.
   - Differentiate between "supplemental qualifications" (credentials, certifications) and "nice-to-have skills" (soft skills, specific tool proficiencies).

6. **Comprehensive Interview Questions with Competency-Based Assessment:**
   - Develop a robust set of interview questions designed to thoroughly assess candidate competency.
   - For EACH question, explicitly state the primary competency being assessed (e.g., problem-solving, leadership, communication).
   - Include a variety of question types (behavioral, situational, technical) to provide a well-rounded assessment. Aim for at least 8-10 high-quality questions.

7. **Persuasive Benefits Description:**
   - Craft a persuasive and engaging benefits description paragraph that highlights the most attractive aspects of the company's benefits package.
   - Focus on the *value* proposition of the benefits to the employee, not just listing features.

8. **Broad Range of Previous Job Titles for Ideal Candidates:**
   - Generate an extensive list of previous job titles that ideal candidates for this role might have held.
   - Include a variety of titles reflecting different levels of experience and industry variations. Aim for a diverse and comprehensive list.

9. **High-Quality Boolean Search String for Expert Candidate Sourcing:**
    You are an expert Boolean Blackbelt for talent sourcing. Create a highly effective boolean search string that would find ideal candidates for this role on LinkedIn or other professional networks.
    
    Create a detailed and comprehensive boolean search string that combines all the following elements:
    - Required job titles (with variations and synonyms) using OR operators inside parentheses
    - Essential hard skills (with variations and synonyms) using OR operators inside parentheses
    - Industries or domains relevant to the role using OR operators inside parentheses
    - All the above sections connected with AND operators
    - Include relevant exclusions with NOT operators to filter out irrelevant results
    - Use quotation marks for exact phrases and proximity operators for related terms
    - Focus only on qualified, experienced professionals (exclude entry-level, intern, student, etc.)
    
    The boolean string MUST be extremely detailed (at least 15-20 terms), properly formatted with parentheses, AND/OR/NOT operators, and quotation marks. It should be ready to use in a LinkedIn or Google search.
    
    Example format:
    ("Senior Software Engineer" OR "Lead Developer" OR "Principal Engineer") AND (JavaScript OR React OR "Node.js" OR GraphQL) AND ("5+ years" OR "senior level" OR experienced) AND ("fintech" OR "financial services" OR banking) NOT (intern OR junior OR graduate OR "entry level")

10. **Strategic Talent Locations with Trend Analysis:**
    - Identify trending talent locations for this role, including specific cities or regions where talent pools are concentrated.
    - Suggest skill-based locations – areas known for producing talent with the required skills.
    - Recommend relevant online communities or platforms where ideal candidates might be found.  Provide reasoning for each location and community suggestion.

11. **Detailed Job Ad Summary with Key Skill Breakdown:**
    - Provide detailed summary paragraphs of the job ad, capturing the essence of the role and company.
    - List key hard skills and soft skills prominently featured in the job description.
    - Reiterate the generated boolean search string for quick access.


Return ONLY JSON data in this exact structure. Ensure ALL sections are filled with rich, detailed, and insightful information as described above. Your analysis is crucial for creating compelling talent acquisition materials and effective candidate coaching resources.

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
