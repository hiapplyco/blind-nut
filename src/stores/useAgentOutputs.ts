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
      if (clientOutput) {
        console.log("Using client-side agent output for job:", jobId);
        return clientOutput;
      }

      if (!jobId) return null;

      console.log("Fetching agent outputs from database for job:", jobId);
      
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

      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent outputs:", error);
        throw error;
      }

      if (!data) {
        console.log("No agent outputs found for job:", jobId);
        return null;
      }

      return {
        id: data.id,
        job_id: data.job_id,
        created_at: data.created_at,
        terms: isTerms(data.terms) ? data.terms : null,
        compensation_analysis: data.compensation_analysis,
        enhanced_description: data.enhanced_description,
        job_summary: data.job_summary
      };
    },
    enabled: !!jobId,
    refetchInterval: (data) => (!data && !clientOutput ? 1000 : false),
    retry: !clientOutput,
    retryDelay: 1000,
    staleTime: 30000,
  });
};