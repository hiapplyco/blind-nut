import { BaseTool, Tool, ToolDefinition } from "../agents/Agent.ts";

export class SkillsExtractionTool extends BaseTool implements Tool {
  definition: ToolDefinition = {
    name: 'skills_extraction',
    description: 'Extract and categorize skills from text (resume, job description, or profile)',
    parameters: {
      text: {
        type: 'string',
        description: 'Text content to extract skills from',
        required: true
      },
      contextType: {
        type: 'string',
        description: 'Type of content: "resume", "job_description", or "profile"',
        required: false
      }
    }
  };

  private skillCategories = {
    programming: ['javascript', 'typescript', 'python', 'java', 'c++', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
    frontend: ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'sass', 'webpack', 'next.js', 'gatsby'],
    backend: ['node.js', 'express', 'django', 'flask', 'spring', 'rails', '.net', 'laravel', 'fastapi'],
    database: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
    cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
    data: ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'spark', 'hadoop', 'tableau'],
    soft: ['leadership', 'communication', 'teamwork', 'problem-solving', 'agile', 'scrum']
  };

  async execute(params: any): Promise<any> {
    this.validateParams(params);

    const { text, contextType = 'general' } = params;

    try {
      const extractedSkills: Record<string, string[]> = {};
      const allSkills: string[] = [];

      // Extract skills by category
      for (const [category, skills] of Object.entries(this.skillCategories)) {
        const foundSkills = skills.filter(skill => {
          // Use word boundaries for more accurate matching
          const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(text);
        });

        if (foundSkills.length > 0) {
          extractedSkills[category] = foundSkills;
          allSkills.push(...foundSkills);
        }
      }

      // Calculate skill levels based on context and frequency
      const skillLevels = this.calculateSkillLevels(text, allSkills);

      // Generate insights
      const insights = this.generateInsights(extractedSkills, contextType);

      return {
        success: true,
        contextType,
        totalSkillsFound: allSkills.length,
        skillsByCategory: extractedSkills,
        skillLevels,
        insights,
        topSkills: allSkills.slice(0, 10)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Skills extraction failed'
      };
    }
  }

  private calculateSkillLevels(text: string, skills: string[]): Record<string, string> {
    const levels: Record<string, string> = {};
    
    for (const skill of skills) {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      const matches = text.match(regex) || [];
      const frequency = matches.length;

      // Look for experience indicators
      const expRegex = new RegExp(`(\\d+\\s*\\+?\\s*years?|expert|senior|advanced|intermediate|junior)\\s+.*${skill}|${skill}.*\\s+(\\d+\\s*\\+?\\s*years?|expert|senior|advanced|intermediate|junior)`, 'i');
      const expMatch = text.match(expRegex);

      let level = 'mentioned';
      
      if (expMatch) {
        if (/expert|senior|advanced|\d{3,}/.test(expMatch[0])) {
          level = 'expert';
        } else if (/intermediate|\d{2}/.test(expMatch[0])) {
          level = 'intermediate';
        } else {
          level = 'beginner';
        }
      } else if (frequency > 3) {
        level = 'proficient';
      } else if (frequency > 1) {
        level = 'familiar';
      }

      levels[skill] = level;
    }

    return levels;
  }

  private generateInsights(skillsByCategory: Record<string, string[]>, contextType: string): string[] {
    const insights: string[] = [];
    const categories = Object.keys(skillsByCategory);

    if (categories.length === 0) {
      insights.push('No technical skills were detected in the provided text.');
      return insights;
    }

    // Analyze skill distribution
    const totalSkills = Object.values(skillsByCategory).flat().length;
    
    if (categories.includes('frontend') && categories.includes('backend')) {
      insights.push('Full-stack development capabilities detected.');
    }

    if (categories.includes('cloud') && totalSkills > 10) {
      insights.push('Strong cloud and DevOps expertise indicated.');
    }

    if (categories.includes('data') && categories.includes('programming')) {
      insights.push('Data engineering or data science background apparent.');
    }

    // Context-specific insights
    if (contextType === 'resume') {
      if (totalSkills > 20) {
        insights.push('Extensive technical skill set - consider focusing on most relevant skills for target role.');
      }
      if (!categories.includes('soft')) {
        insights.push('Consider adding soft skills to provide a more complete profile.');
      }
    } else if (contextType === 'job_description') {
      insights.push(`Role requires expertise in ${categories.length} skill categories.`);
      if (totalSkills > 15) {
        insights.push('This position requires a diverse skill set - senior level role likely.');
      }
    }

    return insights;
  }
}