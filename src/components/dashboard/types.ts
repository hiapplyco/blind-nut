
export interface SearchCardData {
  id: number;
  title: string | null;
  summary: string | null;
  created_at: string;
  user_id: string;
  agent_outputs?: Array<{
    job_summary: string | null;
    compensation_analysis: string | null;
    enhanced_description: string | null;
    terms: any;
    created_at: string;
  }>;
}
