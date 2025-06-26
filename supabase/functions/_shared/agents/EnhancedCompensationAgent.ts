import { GoogleGenerativeAI } from "@google/generative-ai";
import { Agent, ToolRegistry, promptManager, SearchTool, CalculatorTool } from "./Agent.ts";

// Register compensation analysis prompt templates
promptManager.registerTemplate({
  id: 'compensation_analysis',
  name: 'Compensation Analysis',
  template: `You are an expert compensation analyst AI assistant with deep knowledge of salary trends, market rates, and compensation structures.

Task: {{task}}
Context: {{context}}

Available tools:
{{tools}}

For compensation analysis, you should:
1. Research current market rates for the specified role and location
2. Consider factors like experience level, skills, and company size
3. Analyze total compensation including base salary, bonuses, equity, and benefits
4. Provide data-driven recommendations with clear reasoning
5. Include percentile ranges (25th, 50th, 75th, 90th)

When using tools, format your calls as:
<tool_call>
{"name": "tool_name", "params": {"param1": "value1"}}
</tool_call>

Provide your analysis in a structured format with:
- Market summary
- Compensation ranges
- Key factors affecting compensation
- Recommendations
- Data sources and confidence level`,
  variables: ['task', 'context', 'tools']
});

promptManager.registerTemplate({
  id: 'compensation_benchmarking',
  name: 'Compensation Benchmarking',
  template: `You are conducting a compensation benchmarking analysis.

Role: {{role}}
Location: {{location}}
Experience Level: {{experienceLevel}}
Company Size: {{companySize}}
Industry: {{industry}}

Available tools:
{{tools}}

Please provide:
1. Market compensation data for similar roles
2. Comparison with industry standards
3. Geographic adjustments if applicable
4. Total compensation breakdown (base, bonus, equity, benefits)
5. Competitive positioning recommendations

Use search tools to gather current market data and the calculator for any necessary computations.`,
  variables: ['role', 'location', 'experienceLevel', 'companySize', 'industry', 'tools']
});

export interface CompensationAnalysisParams {
  role: string;
  location: string;
  experienceLevel?: string;
  skills?: string[];
  companySize?: string;
  industry?: string;
}

export interface CompensationBenchmark {
  role: string;
  location: string;
  currency: string;
  baseySalary: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  totalCompensation: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  components: {
    baseSalary: string;
    bonus: string;
    equity: string;
    benefits: string;
  };
  factors: string[];
  sources: string[];
  lastUpdated: Date;
  confidence: 'high' | 'medium' | 'low';
}

export class EnhancedCompensationAgent extends Agent<{
  task: 'analyze' | 'benchmark' | 'negotiate' | 'market-research' | 'generate-report';
  role?: string;
  location?: string;
  context?: string;
  marketData?: any;
  competitorData?: any;
}> {
  constructor(model: GoogleGenerativeAI) {
    const template = promptManager.getTemplate('compensation_analysis');
    if (!template) {
      throw new Error('Compensation analysis template not found');
    }

    const toolRegistry = new ToolRegistry();
    
    // Register tools useful for compensation analysis
    toolRegistry.register(new SearchTool());
    toolRegistry.register(new CalculatorTool());

    super(model, template, toolRegistry);
  }

  async analyzeCompensation(params: CompensationAnalysisParams): Promise<CompensationBenchmark> {
    const context = `
      Role: ${params.role}
      Location: ${params.location}
      Experience Level: ${params.experienceLevel || 'Not specified'}
      Skills: ${params.skills?.join(', ') || 'Not specified'}
      Company Size: ${params.companySize || 'Not specified'}
      Industry: ${params.industry || 'Not specified'}
    `;

    const result = await this.run({
      task: 'analyze',
      context
    });

    // Parse and structure the result
    try {
      const analysis = this.parseCompensationAnalysis(result);
      const defaultBenchmark = this.getDefaultBenchmark(params.role, params.location);
      
      // Merge parsed analysis with defaults to ensure all required fields are present
      return {
        ...defaultBenchmark,
        ...analysis,
        role: params.role,
        location: params.location,
        lastUpdated: new Date()
      };
    } catch (error) {
      // Return a default structure if parsing fails
      return this.getDefaultBenchmark(params.role, params.location);
    }
  }

  async generateCompensationReport(
    role: string,
    location: string,
    marketData: any,
    competitorData: any
  ): Promise<string> {
    return this.run({
      task: 'generate-report',
      role,
      location,
      marketData,
      competitorData
    });
  }

  async negotiationGuidance(
    currentOffer: number,
    marketData: CompensationBenchmark,
    candidateProfile: any
  ): Promise<{
    recommendation: string;
    strategy: string;
    talkingPoints: string[];
    targetRange: { min: number; max: number };
  }> {
    const context = `
      Current Offer: ${currentOffer}
      Market P50: ${marketData.baseySalary.p50}
      Market P75: ${marketData.baseySalary.p75}
      Candidate Profile: ${JSON.stringify(candidateProfile)}
    `;

    const result = await this.run({
      task: 'negotiate',
      context
    });

    try {
      return JSON.parse(result);
    } catch {
      return {
        recommendation: result,
        strategy: 'Consider market data and candidate qualifications',
        talkingPoints: ['Market rate comparison', 'Unique qualifications', 'Total compensation'],
        targetRange: { min: marketData.baseySalary.p50, max: marketData.baseySalary.p75 }
      };
    }
  }

  private parseCompensationAnalysis(result: string): Partial<CompensationBenchmark> {
    // This is a simplified parser - in production, you'd want more robust parsing
    const analysis: Partial<CompensationBenchmark> = {
      currency: 'USD',
      baseySalary: { p25: 0, p50: 0, p75: 0, p90: 0 },
      totalCompensation: { p25: 0, p50: 0, p75: 0, p90: 0 },
      components: {
        baseSalary: '60-70%',
        bonus: '10-20%',
        equity: '10-20%',
        benefits: '5-10%'
      },
      factors: [],
      sources: [],
      confidence: 'medium'
    };

    // Extract salary ranges using regex
    const salaryPattern = /\$?([\d,]+)k?\s*-\s*\$?([\d,]+)k?/gi;
    const matches = result.match(salaryPattern);
    
    if (matches && matches.length > 0) {
      // Simple heuristic: use first match for base salary
      const firstMatch = matches[0];
      const numbers = firstMatch.match(/[\d,]+/g);
      if (numbers && numbers.length >= 2) {
        const low = parseInt(numbers[0].replace(/,/g, '')) * (firstMatch.includes('k') ? 1000 : 1);
        const high = parseInt(numbers[1].replace(/,/g, '')) * (firstMatch.includes('k') ? 1000 : 1);
        
        analysis.baseySalary = {
          p25: low,
          p50: Math.round((low + high) / 2),
          p75: high,
          p90: Math.round(high * 1.2)
        };
      }
    }

    // Extract confidence level
    if (/high confidence|strong data|reliable/i.test(result)) {
      analysis.confidence = 'high';
    } else if (/low confidence|limited data|uncertain/i.test(result)) {
      analysis.confidence = 'low';
    }

    // Extract factors
    const factorPatterns = [
      /location/i,
      /experience/i,
      /skills/i,
      /company size/i,
      /industry/i,
      /demand/i
    ];
    
    analysis.factors = factorPatterns
      .filter(pattern => pattern.test(result))
      .map(pattern => pattern.source.replace(/[/\\]/g, ''));

    return analysis;
  }

  private getDefaultBenchmark(role: string, location: string): CompensationBenchmark {
    // Fallback data when parsing fails
    return {
      role,
      location,
      currency: 'USD',
      baseySalary: {
        p25: 80000,
        p50: 100000,
        p75: 120000,
        p90: 150000
      },
      totalCompensation: {
        p25: 100000,
        p50: 130000,
        p75: 160000,
        p90: 200000
      },
      components: {
        baseSalary: '70%',
        bonus: '15%',
        equity: '10%',
        benefits: '5%'
      },
      factors: ['Market average', 'Location-based'],
      sources: ['Internal estimates'],
      lastUpdated: new Date(),
      confidence: 'low'
    };
  }
}