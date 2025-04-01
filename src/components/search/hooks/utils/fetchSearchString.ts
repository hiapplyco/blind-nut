
import { supabase } from "@/integrations/supabase/client";

export const fetchSearchString = async (currentJobId: number | null) => {
  if (!currentJobId) return null;
  
  const { data, error } = await supabase
    .from('jobs')
    .select('search_string')
    .eq('id', currentJobId)
    .single();

  if (error) {
    console.error('Error fetching search string:', error);
    return null;
  }

  return data?.search_string || null;
};
