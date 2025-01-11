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

export const useAgentOutputs = (jobId: number | null) => {
  return useQuery({
    queryKey: ["agent-outputs", jobId],
    queryFn: async (): Promise<AgentOutput | null> => {
      if (!jobId) return null;

      console.log("Fetching agent outputs for job:", jobId);
      
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent outputs:", error);
        throw error;
      }

      console.log("Received agent outputs:", data);
      return data;
    },
    enabled: !!jobId,
    // Refresh data every 3 seconds while waiting for results
    refetchInterval: (data) => (!data ? 3000 : false),
  });
};