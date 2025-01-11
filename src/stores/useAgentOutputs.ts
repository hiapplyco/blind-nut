import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
    enabled: !!jobId,
  });
};