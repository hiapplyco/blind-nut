
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { SearchType } from "./types";
import { toast } from "sonner";
import { processJobRequirements } from "@/utils/jobRequirements";
import { supabase } from "@/integrations/supabase/client";
import { generateSummary } from "./utils/generateSummary";
import { createJob } from "./utils/createJob";
import { processFileUpload } from "./utils/processFileUpload";
import { fetchSearchString } from "./utils/fetchSearchString";

export const useSearchForm = (
  userId: string | null,
  onJobCreated: (jobId: number, searchText: string, data?: any) => void,
  currentJobId: number | null,
  source: 'default' | 'clarvida' = 'default'
) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content) {
      setSearchText(state.content);
      if (state?.autoRun) {
        window.history.replaceState({}, document.title);
        setTimeout(() => {
          handleSubmit(new Event('submit') as any);
        }, 0);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const getSearchString = async () => {
      const result = await fetchSearchString(currentJobId);
      if (result) {
        setSearchString(result);
      }
    };

    getSearchString();
  }, [currentJobId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchText?.trim()) {
      toast.error("Please enter some content before submitting");
      return;
    }

    if (searchType === "candidates-at-company" && !companyName?.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsProcessing(true);

    try {
      console.log(`Processing form submission for source: ${source || 'default'}`);
      const { title, summary } = await generateSummary(searchText);

      const jobId = await createJob(searchText, userId, title, summary, source);
      
      console.log(`Calling processJobRequirements with source: ${source || 'default'}`);
      const result = await processJobRequirements(searchText, searchType, companyName, userId, source);
      console.log('Received result from processJobRequirements:', result);
      
      if (source === 'clarvida') {
        // For Clarvida, pass the data directly to the callback
        console.log('Processing Clarvida result, data:', result?.data);
        if (!result || !result.data) {
          throw new Error('Failed to generate Clarvida report: No data returned');
        }
        onJobCreated(jobId, searchText, result.data);
        toast.success("Analysis complete!");
      } else {
        // For the regular search flow
        if (!result?.searchString) {
          throw new Error('Failed to generate search string');
        }

        const { error: updateError } = await supabase
          .from('jobs')
          .update({ search_string: result.searchString })
          .eq('id', jobId);

        if (updateError) throw updateError;

        setSearchString(result.searchString);
        onJobCreated(jobId, searchText);
        toast.success("Search string generated successfully!");
      }

    } catch (error) {
      console.error('Error processing content:', error);
      toast.error(error instanceof Error ? error.message : "Failed to process content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [searchText, searchType, companyName, userId, onJobCreated, source]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFileUpload(file, userId, setSearchText, setIsProcessing);
    }
  }, [userId]);

  return {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    isProcessing,
    isScrapingProfiles,
    searchType,
    setSearchType,
    searchString,
    handleSubmit,
    handleFileUpload,
  };
};
