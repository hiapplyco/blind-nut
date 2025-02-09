
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ResumeMatch } from "../types";

export const useResumeMatches = (jobId: number) => {
  return useQuery({
    queryKey: ["resume-matches", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_matches")
        .select(`
          id,
          similarity_score,
          matching_keywords,
          matching_entities,
          created_at,
          parsed_resume,
          parsed_job
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
        throw error;
      }
      return data as ResumeMatch[];
    },
    retry: 1
  });
};
