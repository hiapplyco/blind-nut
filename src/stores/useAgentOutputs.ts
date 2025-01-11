import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentOutput, Terms } from "@/types/agent";

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ["agentOutputs", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .single();

      if (error) throw error;

      // Transform the raw data into the expected AgentOutput type
      const transformedData: AgentOutput = {
        ...data,
        terms: data.terms as Terms || null
      };

      return transformedData;
    },
    enabled: !!jobId,
  });
};