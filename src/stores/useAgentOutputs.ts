import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentOutput, Terms } from "@/types/agent";

// Type guard to check if the value matches Terms interface
const isTerms = (value: any): value is Terms => {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray(value.skills) &&
    Array.isArray(value.titles) &&
    Array.isArray(value.keywords)
  );
};

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ["agentOutputs", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Transform the raw data into the expected AgentOutput type
      const transformedData: AgentOutput = {
        ...data,
        terms: isTerms(data.terms) ? data.terms : null
      };

      return transformedData;
    },
    enabled: !!jobId,
  });
};