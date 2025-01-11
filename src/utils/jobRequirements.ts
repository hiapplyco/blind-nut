import { supabase } from "@/integrations/supabase/client";

type SearchType = "candidates" | "companies" | "candidates-at-company";

export const processJobRequirements = async (
  content: string, 
  searchType: SearchType, 
  companyName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName }
    });

    if (error) throw error;

    // Store the search in Supabase
    if (userId) {
      const { error: dbError } = await supabase
        .from('jobs')
        .insert([
          { 
            content, 
            search_string: data.searchString,
            user_id: userId
          }
        ]);

      if (dbError) throw dbError;
    }

    // Open new tab with Google search
    const searchString = encodeURIComponent(data.searchString);
    window.open(`https://www.google.com/search?q=${searchString}`, '_blank');

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};