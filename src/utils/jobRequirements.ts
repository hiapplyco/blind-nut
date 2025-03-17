
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
      console.log('Calling generate-clarvida-report function with content length:', content.length);
      const { data, error } = await supabase.functions.invoke('generate-clarvida-report', {
        body: { content }
      });

      if (error) {
        console.error('Error from generate-clarvida-report:', error);
        throw error;
      }
      
      console.log('Received data from generate-clarvida-report function:', data);
      return data;
    }
    
    // Otherwise use the regular process-job-requirements function
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName, userId, source }
    });

    if (error) {
      console.error('Error from process-job-requirements:', error);
      throw error;
    }
    
    console.log('Received data from process-job-requirements function:', data);
    return data;
  } catch (error) {
    console.error('Error processing job requirements:', error);
    throw error;
  }
};
