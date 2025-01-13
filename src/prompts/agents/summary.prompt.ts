import { PromptTemplate } from '../types';

export const summaryPrompt: PromptTemplate = {
  name: "Job Summary",
  version: "1.0.0",
  description: "Creates a concise summary of job descriptions",
  parameters: ["content"],
  template: `As a senior Talent Acquisition professional, create a compelling and comprehensive summary of this job description using clear formatting. Focus on the key aspects that would most interest potential candidates:

📝 Comprehensive Job Summary

🎯 Position Overview
• Role: [Specific job title and level]
• Industry: [Business sector/domain]
• Location: [Work arrangement - remote/hybrid/onsite]
• Company Type: [Size, stage, market position]

💫 Key Responsibilities & Impact
• Primary Focus: [Main objective and purpose]
• Core Duties: [3-4 key responsibilities]
• Strategic Impact: [How role affects business]
• Team Context: [Reporting structure & collaboration]

🎓 Required Qualifications
• Technical Skills: [Critical technical requirements]
• Experience Level: [Years and type of experience]
• Education: [Required degrees/certifications]
• Industry Knowledge: [Sector expertise needed]

🌟 Key Competencies
• Technical Expertise: [Specific tools/technologies]
• Soft Skills: [Critical interpersonal abilities]
• Leadership: [Management/mentoring requirements]
• Communication: [Important communication skills]

📈 Growth & Opportunity
• Career Path: [Progression opportunities]
• Learning: [Development resources]
• Impact: [Ability to influence outcomes]
• Innovation: [Opportunity to drive change]

🎁 Package Highlights
• Compensation: [Salary range if provided]
• Benefits: [Key benefits overview]
• Perks: [Notable additional benefits]
• Work Style: [Flexibility/arrangements]

Job description: {{content}}`
};