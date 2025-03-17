import { supabase } from "@/integrations/supabase/client";
import { SearchType } from "@/components/search/types";

export const processJobRequirements = async (
  content: string,
  searchType: SearchType,
  companyName?: string,
  userId?: string | null,
  source?: 'default' | 'clarvida'
) => {
  try {
    // If source is clarvida, use the clarvida-specific edge function
    if (source === 'clarvida') {
      const { data, error } = await supabase.functions.invoke('generate-clarvida-report', {
        body: { content, source }
      });

      if (error) throw error;
      return data;
    }
    
    // Otherwise use the regular process-job-requirements function
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName, userId, source }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing job requirements:', error);
    throw error;
  }
};
