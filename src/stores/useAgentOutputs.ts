import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Terms } from "@/types/agent";

interface AgentOutput {
  id: number;
  job_id: number;
  terms: Terms | null;
  compensation_analysis: string | null;
  enhanced_description: string | null;
  job_summary: string | null;
}

function isTerms(value: unknown): value is Terms {
  if (typeof value !== 'object' || value === null) return false;
  const terms = value as Record<string, unknown>;
  return Array.isArray(terms.skills) && 
         Array.isArray(terms.titles) && 
         Array.isArray(terms.keywords);
}

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ['agent-outputs', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from('agent_outputs')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Transform and validate the data
      const output: AgentOutput = {
        id: data.id,
        job_id: data.job_id,
        terms: isTerms(data.terms) ? data.terms : null,
        compensation_analysis: typeof data.compensation_analysis === 'string' ? data.compensation_analysis : null,
        enhanced_description: typeof data.enhanced_description === 'string' ? data.enhanced_description : null,
        job_summary: typeof data.job_summary === 'string' ? data.job_summary : null
      };

      return output;
    },
    enabled: !!jobId
  });
};