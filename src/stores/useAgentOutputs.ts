import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Terms } from "@/types/agent";

interface AgentOutput {
  id: number;
  job_id: number;
  created_at: string | null;
  terms: Terms | null;
  compensation_analysis: string | null;
  enhanced_description: string | null;
  job_summary: string | null;
}

function isTerms(value: unknown): value is Terms {
  if (typeof value !== 'object' || value === null) return false;
  const terms = value as Record<string, unknown>;
  return (
    Array.isArray(terms.skills) &&
    Array.isArray(terms.titles) &&
    Array.isArray(terms.keywords) &&
    terms.skills.every(skill => typeof skill === 'string') &&
    terms.titles.every(title => typeof title === 'string') &&
    terms.keywords.every(keyword => typeof keyword === 'string')
  );
}

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ["agent-outputs", jobId],
    queryFn: async (): Promise<AgentOutput | null> => {
      if (!jobId) return null;

      console.log("Fetching agent outputs for job:", jobId);
      
      // First verify if the job exists
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .maybeSingle();

      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw jobError;
      }

      if (!jobData) {
        console.log("No job found with id:", jobId);
        return null;
      }

      // Now fetch the agent outputs
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent outputs:", error);
        throw error;
      }

      if (!data) {
        console.log("No agent outputs found for job:", jobId);
        return null;
      }

      // Transform and validate the data
      const output: AgentOutput = {
        id: data.id,
        job_id: data.job_id,
        created_at: data.created_at,
        terms: isTerms(data.terms) ? data.terms : null,
        compensation_analysis: data.compensation_analysis,
        enhanced_description: data.enhanced_description,
        job_summary: data.job_summary
      };

      console.log("Processed agent outputs:", output);
      return output;
    },
    enabled: !!jobId,
    // Refetch more frequently until we get data
    refetchInterval: (data) => (!data ? 1000 : false),
    // Keep retrying if we don't get data
    retry: true,
    retryDelay: 1000,
    // Consider data fresh for 30 seconds once we have it
    staleTime: 30000,
  });
};