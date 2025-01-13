import { PromptTemplate } from './types.ts';

export const compensationPrompt: PromptTemplate = {
  name: "Compensation Analysis",
  version: "1.0.0",
  description: "Analyzes job compensation details and benefits package",
  parameters: ["content"],
  template: `As a seasoned Talent Acquisition expert with deep knowledge of compensation structures and market trends, analyze the compensation details in this job description. Format your response in markdown with clear, engaging headers and emphasis on key points. Include:

# 💰 Comprehensive Compensation Analysis

## 📊 Base Salary Range
- **Specified Range:** [Extract or estimate the salary range based on role, location, and industry standards]
- *Market Position:* [How this compares to market averages, whether it's competitive]
- **Location Factor:** [How location impacts the compensation]

## 🎯 Total Compensation Package
- **Performance Bonuses:** [Details of any performance-based compensation]
- **Equity Components:** [Stock options, RSUs, or other equity compensation]
- **Additional Incentives:** [Commission structure, profit sharing, performance bonuses]
- *Total Package Value:* [Estimated total compensation range]

## ✨ Benefits and Perks Analysis
- **Healthcare Coverage:**
  - Medical insurance details
  - Dental and vision coverage
  - Health savings accounts or flexible spending options
- **Time Off Benefits:**
  - Vacation policy
  - Sick leave
  - Paid holidays
  - Parental leave
- **Additional Benefits:**
  - 401(k) or retirement plans
  - Life insurance
  - Disability coverage
  - Professional development allowance

## 📈 Market Context and Competitiveness
- **Industry Alignment:** [How the package compares to industry standards]
- **Competitive Analysis:** [Strengths and potential gaps in the offering]
- **Growth Potential:** [Career progression and compensation growth opportunities]
- *Market Trends:* [Relevant compensation trends in this sector]

## 🌟 Notable Compensation Policies
- **Unique Benefits:** [Standout or unusual perks]
- **Work Arrangement Benefits:** [Remote work stipends, home office allowances]
- **Wellness Programs:** [Health and wellness benefits]
- **Professional Growth:** [Training budgets, certification support]

## 💡 Strategic Insights
- **Attraction Factors:** [Key selling points of the compensation package]
- **Retention Elements:** [Components designed for long-term retention]
- **Areas for Negotiation:** [Flexible components of the package]

Job description: {{content}}`
};