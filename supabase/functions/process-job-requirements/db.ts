
import { supabaseClient } from "../_shared/supabase-client.ts";

/**
 * Creates a job record in the database
 * @param userId The user ID
 * @param content The job content
 * @param searchString The generated search string
 * @param source The source of the job
 * @param searchType Optional search type
 * @returns The created job record ID
 */
export async function createJobRecord(
  userId: string,
  content: string,
  searchString: string,
  source: string,
  searchType?: string
) {
  // Only include fields that exist in the jobs table
  const jobData: Record<string, any> = {
    user_id: userId,
    content: content,
    search_string: searchString,
    source: source || 'default'
  };
  
  // Add searchType if supported by schema
  if (searchType) {
    jobData.search_type = searchType;
  }
  
  // Insert job data without fields that don't exist in schema
  const { data, error } = await supabaseClient
    .from('jobs')
    .insert(jobData)
    .select('id')
    .single();
    
  if (error) {
    console.error("Error inserting job:", error);
    throw error;
  }
  
  console.log("Job created with ID:", data.id);
  return data.id;
}
