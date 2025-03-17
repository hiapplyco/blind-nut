
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SearchType } from "../types";
import { toast } from "sonner";
import { processJobRequirements } from "@/utils/jobRequirements";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

export const useSearchForm = (
  userId: string | null,
  onJobCreated: (jobId: number, searchText: string, data?: any) => void,
  currentJobId: number | null,
  source?: 'default' | 'clarvida'
) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [searchString, setSearchString] = useState("");
  const { setSearchResults } = useClientAgentOutputs();

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
    const fetchSearchString = async () => {
      if (currentJobId) {
        const { data, error } = await supabase
          .from('jobs')
          .select('search_string')
          .eq('id', currentJobId)
          .single();

        if (error) {
          console.error('Error fetching search string:', error);
          return;
        }

        if (data?.search_string) {
          setSearchString(data.search_string);
        }
      }
    };

    fetchSearchString();
  }, [currentJobId]);

  const generateSummary = async (content: string) => {
    if (!content?.trim()) {
      throw new Error('Content is required');
    }

    try {
      const { data, error } = await supabase.functions.invoke('summarize-title', {
        body: { content }
      });

      if (error) throw error;

      return {
        title: data?.title || 'Untitled Search',
        summary: data?.summary || ''
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  };

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
      if (jobId) {
        setSearchResults(jobId, [], "", 0);
      }
      
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
  }, [searchText, searchType, companyName, userId, onJobCreated, setSearchResults, source]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error("Invalid file type. Please upload a PDF file or an image");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId || '');

    try {
      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: formData,
      });

      if (error) throw error;

      if (data?.text) {
        setSearchText(data.text);
        toast.success("File processed successfully. The content has been extracted and added to the input field.");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error("Failed to process the file. Please try again.");
    } finally {
      setIsProcessing(false);
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
