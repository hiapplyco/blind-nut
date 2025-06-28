
export interface AgentOutput {
  id: number;
  job_id: number;
  agent_type: string;
  output_data: any;
  created_at: string;
  updated_at: string;
  key_terms?: string;
  compensation_analysis?: string;
  enhanced_description?: string;
  job_summary?: string;
}

export interface AgentOutputResponse {
  success: boolean;
  data?: AgentOutput;
  error?: string;
}
