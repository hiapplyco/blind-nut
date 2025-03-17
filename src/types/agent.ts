
export interface Terms {
  skills: string[];
  titles: string[];
  keywords: string[];
}

export interface AgentOutput {
  id: number;
  job_id: number | null;
  created_at: string | null;
  terms: Terms | null;
  compensation_analysis: string | null;
  enhanced_description: string | null;
  job_summary: string | null;
  searchString?: string; // Added searchString property as optional
}
