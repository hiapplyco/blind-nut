
import { supabase } from "@/integrations/supabase/client";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

export const createJob = async (
  searchText: string,
  userId: string | null,
  title: string,
  summary: string,
  source: 'default' | 'clarvida' = 'default'
) => {
  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .insert({
      content: searchText,
      user_id: userId,
      title,
      summary,
      source: source || 'default'
    })
    .select()
    .single();

  if (jobError) {
    console.error('Error creating job:', jobError);
    throw jobError;
  }
  
  const jobId = jobData.id;
  console.log(`Created job with ID: ${jobId}`);
  
  // Clear previous search results when creating a new job
  const { setSearchResults } = useClientAgentOutputs.getState();
  if (jobId) {
    setSearchResults(jobId, [], "", 0);
  }
  
  return jobId;
};
