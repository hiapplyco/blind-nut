
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processJobRequirements } from "@/utils/jobRequirements";
import { SearchType } from "./types";
import { generateSummary } from "./utils/generateSummary";
import { createJob } from "./utils/createJob";

export const useFormSubmit = (
  userId: string | null,
  onJobCreated: (jobId: number, searchText: string) => void,
  source: 'default' | 'clarvida' = 'default'
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    searchText: string,
    searchType: SearchType,
    companyName: string
  ) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Generate title and summary
      const { title, summary } = await generateSummary(searchText);
      
      // Create job in database
      const jobId = await createJob(searchText, userId, title, summary, source);
      
      // Notify parent component
      onJobCreated(jobId, searchText);

      // Process content based on search type
      const result = await processJobRequirements(searchText, searchType, companyName, userId, source);
      
      // Update job with search string
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ search_string: result.searchString })
        .eq('id', jobId);

      if (updateError) throw updateError;

      toast.success("Search string generated successfully!");
      return result.searchString;

    } catch (error) {
      console.error('Error processing content:', error);
      toast.error("Failed to process content. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    isScrapingProfiles,
    setIsScrapingProfiles,
    handleSubmit
  };
};
