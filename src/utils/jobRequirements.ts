
import { supabase } from "@/integrations/supabase/client";

type SearchType = "candidates" | "candidates-at-company";

export const processJobRequirements = async (
  content: string,
  searchType: SearchType,
  companyName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName, userId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing job requirements:', error);
    throw error;
  }
};
