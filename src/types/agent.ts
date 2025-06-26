
// Agent types for the application
export interface AgentOutput {
  id: number;
  job_id: number;
  agent_type: string;
  output_data: any;
  created_at: string;
}

export interface KeyTerms {
  skills: string[];
  titles: string[];
  keywords: string[];
}

export interface SearchAnalysis {
  summary: string;
  keyTerms: KeyTerms;
  recommendations: string[];
}
