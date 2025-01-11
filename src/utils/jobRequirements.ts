import { supabase } from "@/integrations/supabase/client";

type SearchType = "candidates" | "companies" | "candidates-at-company";

export const processJobRequirements = async (content: string, searchType: SearchType, companyName?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName }
    });

    if (error) throw error;

    // Open new tab with Google search
    const searchString = encodeURIComponent(data.searchString);
    window.open(`https://www.google.com/search?q=${searchString}`, '_blank');

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};