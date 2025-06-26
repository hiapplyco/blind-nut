import { BaseTool, Tool, ToolDefinition } from "../agents/Agent.ts";

interface ParsedResume {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    year?: string;
  }>;
  skills: string[];
  certifications?: string[];
}

export class ResumeParseTool extends BaseTool implements Tool {
  definition: ToolDefinition = {
    name: 'resume_parse',
    description: 'Parse and extract structured information from resume text',
    parameters: {
      resumeText: {
        type: 'string',
        description: 'Raw text content of the resume',
        required: true
      },
      format: {
        type: 'string',
        description: 'Output format: "structured" or "summary"',
        required: false
      }
    }
  };

  async execute(params: any): Promise<any> {
    this.validateParams(params);

    const { resumeText, format = 'structured' } = params;

    try {
      const parsed = this.parseResume(resumeText);
      
      if (format === 'summary') {
        return {
          success: true,
          summary: this.generateSummary(parsed),
          keyHighlights: this.extractKeyHighlights(parsed)
        };
      }

      return {
        success: true,
        parsedData: parsed,
        metadata: {
          totalExperience: this.calculateTotalExperience(parsed.experience),
          seniorityLevel: this.determineSeniorityLevel(parsed),
          primarySkills: parsed.skills.slice(0, 5)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resume parsing failed'
      };
    }
  }

  private parseResume(text: string): ParsedResume {
    const parsed: ParsedResume = {
      personalInfo: {},
      experience: [],
      education: [],
      skills: []
    };

    // Extract email
    const emailMatch = text.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    if (emailMatch) {
      parsed.personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      parsed.personalInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
      parsed.personalInfo.linkedin = `https://${linkedinMatch[0]}`;
    }

    // Extract GitHub
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) {
      parsed.personalInfo.github = `https://${githubMatch[0]}`;
    }

    // Extract name (usually first line or near top)
    const namePatterns = [
      /^([A-Z][a-z]+ ){1,3}[A-Z][a-z]+$/m,
      /^([A-Z]\. ){0,2}[A-Z][a-z]+ [A-Z][a-z]+$/m
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch) {
        parsed.personalInfo.name = nameMatch[0];
        break;
      }
    }

    // Extract experience sections
    const experienceSection = this.extractSection(text, ['experience', 'work history', 'employment']);
    if (experienceSection) {
      parsed.experience = this.parseExperience(experienceSection);
    }

    // Extract education
    const educationSection = this.extractSection(text, ['education', 'academic']);
    if (educationSection) {
      parsed.education = this.parseEducation(educationSection);
    }

    // Extract skills
    const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'competencies']);
    if (skillsSection) {
      parsed.skills = this.parseSkills(skillsSection);
    }

    // Extract summary
    const summarySection = this.extractSection(text, ['summary', 'objective', 'profile', 'about']);
    if (summarySection) {
      parsed.summary = summarySection.slice(0, 500); // Limit summary length
    }

    return parsed;
  }

  private extractSection(text: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  private parseExperience(text: string): ParsedResume['experience'] {
    const experiences: ParsedResume['experience'] = [];
    
    // Simple pattern matching for experience entries
    const entries = text.split(/\n(?=[A-Z])/);
    
    for (const entry of entries) {
      const lines = entry.split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        const titleCompany = lines[0];
        const duration = lines.find(line => /\d{4}|\bpresent\b/i.test(line)) || '';
        const description = lines.slice(1).join(' ').slice(0, 200);
        
        experiences.push({
          company: titleCompany.split(/\bat\b|\b-\b|\b,\b/)[1]?.trim() || 'Company',
          title: titleCompany.split(/\bat\b|\b-\b|\b,\b/)[0]?.trim() || 'Position',
          duration,
          description
        });
      }
    }
    
    return experiences;
  }

  private parseEducation(text: string): ParsedResume['education'] {
    const education: ParsedResume['education'] = [];
    
    const entries = text.split(/\n(?=[A-Z])/);
    
    for (const entry of entries) {
      const degreeMatch = entry.match(/\b(Bachelor|Master|PhD|B\.S\.|M\.S\.|MBA|B\.A\.|M\.A\.)\b/i);
      const yearMatch = entry.match(/\b(19|20)\d{2}\b/);
      
      if (degreeMatch) {
        education.push({
          institution: entry.split('\n')[0] || 'Institution',
          degree: degreeMatch[0],
          year: yearMatch ? yearMatch[0] : undefined
        });
      }
    }
    
    return education;
  }

  private parseSkills(text: string): string[] {
    // Remove common words and split by various delimiters
    const skills = text
      .replace(/\b(and|with|in|of|for|the|a|an)\b/gi, '')
      .split(/[,;\n•·]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 30)
      .filter(skill => /^[A-Za-z]/.test(skill));
    
    return [...new Set(skills)]; // Remove duplicates
  }

  private calculateTotalExperience(experiences: ParsedResume['experience']): string {
    let totalMonths = 0;
    
    for (const exp of experiences) {
      const duration = exp.duration.toLowerCase();
      const yearsMatch = duration.match(/(\d+)\s*year/);
      const monthsMatch = duration.match(/(\d+)\s*month/);
      
      if (yearsMatch) {
        totalMonths += parseInt(yearsMatch[1]) * 12;
      }
      if (monthsMatch) {
        totalMonths += parseInt(monthsMatch[1]);
      }
    }
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years > 0 && months > 0) {
      return `${years} years ${months} months`;
    } else if (years > 0) {
      return `${years} years`;
    } else if (months > 0) {
      return `${months} months`;
    }
    
    return 'Not specified';
  }

  private determineSeniorityLevel(parsed: ParsedResume): string {
    const expYears = this.calculateTotalExperience(parsed.experience);
    const yearMatch = expYears.match(/(\d+)\s*year/);
    const years = yearMatch ? parseInt(yearMatch[1]) : 0;
    
    // Check for senior indicators in titles
    const titles = parsed.experience.map(exp => exp.title.toLowerCase()).join(' ');
    const hasSeniorTitle = /senior|lead|principal|manager|director|vp|chief/.test(titles);
    
    if (years >= 10 || /chief|vp|director/.test(titles)) {
      return 'Executive/Director';
    } else if (years >= 7 || hasSeniorTitle) {
      return 'Senior';
    } else if (years >= 3) {
      return 'Mid-level';
    } else if (years >= 1) {
      return 'Junior';
    }
    
    return 'Entry-level';
  }

  private generateSummary(parsed: ParsedResume): string {
    const name = parsed.personalInfo.name || 'Candidate';
    const seniority = this.determineSeniorityLevel(parsed);
    const topSkills = parsed.skills.slice(0, 3).join(', ');
    const latestRole = parsed.experience[0]?.title || 'Professional';
    
    return `${name} is a ${seniority} ${latestRole} with expertise in ${topSkills || 'various technologies'}. ${parsed.summary || ''}`.trim();
  }

  private extractKeyHighlights(parsed: ParsedResume): string[] {
    const highlights: string[] = [];
    
    // Add experience highlight
    const totalExp = this.calculateTotalExperience(parsed.experience);
    if (totalExp !== 'Not specified') {
      highlights.push(`${totalExp} of professional experience`);
    }
    
    // Add education highlight
    const highestDegree = parsed.education.find(edu => 
      /master|mba|phd/i.test(edu.degree)
    );
    if (highestDegree) {
      highlights.push(`${highestDegree.degree} from ${highestDegree.institution}`);
    }
    
    // Add top skills
    if (parsed.skills.length > 0) {
      highlights.push(`Skilled in ${parsed.skills.slice(0, 3).join(', ')}`);
    }
    
    // Add latest company
    if (parsed.experience.length > 0) {
      highlights.push(`Currently/Recently at ${parsed.experience[0].company}`);
    }
    
    return highlights;
  }
}