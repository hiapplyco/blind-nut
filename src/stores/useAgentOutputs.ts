import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Terms } from "@/types/agent";
import { useClientAgentOutputs } from "./useClientAgentOutputs";

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
  const { getOutput } = useClientAgentOutputs();
  const clientOutput = jobId ? getOutput(jobId) : null;

  return useQuery({
    queryKey: ["agent-outputs", jobId],
    queryFn: async () => {
      // If we have client-side data, return it immediately
      if (clientOutput) {
        console.log("Using client-side agent output for job:", jobId);
        return clientOutput;
      }

      if (!jobId) return null;

      console.log("Fetching agent outputs from database for job:", jobId);
      
      // First verify if the job exists
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .limit(1);

      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw jobError;
      }

      if (!jobData?.length) {
        console.log("No job found with id:", jobId);
        return null;
      }

      // Now fetch the agent outputs
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching agent outputs:", error);
        throw error;
      }

      if (!data?.length) {
        console.log("No agent outputs found for job:", jobId);
        return null;
      }

      const output = data[0];

      // Transform and validate the data
      return {
        id: output.id,
        job_id: output.job_id,
        created_at: output.created_at,
        terms: isTerms(output.terms) ? output.terms : null,
        compensation_analysis: output.compensation_analysis,
        enhanced_description: output.enhanced_description,
        job_summary: output.job_summary
      };
    },
    enabled: !!jobId,
    // Only refetch if we don't have client-side data
    refetchInterval: (data) => (!data && !clientOutput ? 1000 : false),
    retry: !clientOutput, // Only retry if we don't have client-side data
    retryDelay: 1000,
    staleTime: 30000,
  });
};