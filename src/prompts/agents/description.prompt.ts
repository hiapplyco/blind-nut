import { PromptTemplate } from '../types';

export const enhanceDescriptionPrompt: PromptTemplate = {
  name: "Enhanced Job Description",
  version: "1.0.0",
  description: "Enhances and structures job descriptions for better readability and appeal",
  parameters: ["content"],
  template: `As an experienced Talent Acquisition specialist, enhance this job description using clear formatting with headers and emphasis on key points that will attract top talent. Create a comprehensive, well-structured description that highlights:

🚀 Enhanced Job Description

🏢 Company Impact & Culture
• Mission & Vision: What makes this company unique and inspiring
• Company Culture: Key aspects of work environment and values
• Growth Trajectory: Company's market position and future vision
• Innovation Focus: How the company drives industry change

💫 Role Overview & Impact
• Position Impact: How this role contributes to company success
• Key Objectives: Clear definition of what success looks like
• Team Context: Where this role fits in the organization
• Strategic Value: How this role shapes company direction

📋 Essential Qualifications
• Technical Expertise: Must-have technical skills and tools
• Experience Level: Required years and type of background
• Industry Knowledge: Specific sector expertise needed
• Core Competencies: Critical technical requirements
• Soft Skills: Essential interpersonal abilities

🌟 Preferred Qualifications
• Advanced Skills: Nice-to-have technical expertise
• Additional Experience: Beneficial background areas
• Industry Insights: Valuable sector knowledge
• Leadership Abilities: Management or mentoring experience
• Certifications: Relevant professional certifications

📈 Growth & Development
• Career Progression: Clear advancement opportunities
• Professional Development: Learning and growth resources
• Mentorship: Available guidance and support systems
• Training Programs: Structured learning opportunities
• Innovation Opportunities: Chances to drive change

🎯 Success Metrics & Expectations
• First 90 Days: Initial objectives and milestones
• Key Responsibilities: Primary duties and projects
• Performance Indicators: How success will be measured
• Team Collaboration: Cross-functional partnerships
• Strategic Goals: Long-term objectives

🤝 Work Environment & Culture
• Team Structure: Immediate team composition
• Collaboration Style: How the team works together
• Work Arrangement: Remote/hybrid/office expectations
• Company Values: Core principles in action
• Innovation Culture: Approach to new ideas

📊 Impact & Outcomes
• Business Impact: How role affects company success
• Team Influence: Leadership and mentoring opportunities
• Growth Potential: Future role evolution
• Innovation Scope: Opportunities to drive change
• Success Metrics: Key performance indicators

🌈 Diversity & Inclusion
• Inclusive Culture: Commitment to diversity
• Equal Opportunity: Fair hiring practices
• Support Systems: Employee resource groups
• Accessibility: Accommodations and support

🎁 Benefits & Perks Highlights
• Health & Wellness: Comprehensive benefits
• Work-Life Balance: Flexible arrangements
• Professional Growth: Development opportunities
• Additional Perks: Unique company benefits

🚀 Next Steps & Application
• Application Process: How to apply
• Timeline: What to expect
• Contact Details: Who to reach out to
• Required Materials: What to submit

Original job description: {{content}}`
};