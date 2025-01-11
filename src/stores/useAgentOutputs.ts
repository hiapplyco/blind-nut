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

// Type guard to check if an object matches the Terms interface
function isTerms(obj: any): obj is Terms {
  return (
    obj &&
    Array.isArray(obj.skills) &&
    Array.isArray(obj.titles) &&
    Array.isArray(obj.keywords)
  );
}

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ["agent-outputs", jobId],
    queryFn: async () => {
      if (!jobId) return null;

      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent outputs:", error);
        throw error;
      }

      if (!data) return null;

      // Transform the data to ensure type safety
      const output: AgentOutput = {
        id: data.id,
        job_id: data.job_id,
        terms: isTerms(data.terms) ? data.terms : null,
        compensation_analysis: data.compensation_analysis,
        enhanced_description: data.enhanced_description,
        job_summary: data.job_summary
      };

      return output;
    },
    enabled: !!jobId
  });
};