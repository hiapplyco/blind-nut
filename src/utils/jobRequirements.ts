import { supabase } from "@/integrations/supabase/client";

type SearchType = "candidates" | "companies" | "candidates-at-company";

export const processJobRequirements = async (
  content: string,
  // searchType: SearchType, // Removed searchType
  // companyName?: string, // Removed companyName
  userId?: string
) => {
  try {
    // Removed searchType and companyName from the body
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, userId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing job requirements:', error);
    throw error;
  }
};