
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SearchType } from "../types";
import { toast } from "sonner";
import { processJobRequirements } from "@/utils/jobRequirements";

export const useSearchForm = (
  userId: string,
  onJobCreated: (jobId: number, searchText: string) => void,
  currentJobId: number | null
) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    // Handle auto-run from location state
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content) {
      setSearchText(state.content);
      // Only auto-submit if autoRun is true
      if (state?.autoRun) {
        // Clear the state to prevent re-running
        window.history.replaceState({}, document.title);
        // Use setTimeout to ensure state is updated before submitting
        setTimeout(() => {
          handleSubmit(new Event('submit') as any);
        }, 0);
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch search string when job is created
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
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
      // Generate title and summary first
      const { title, summary } = await generateSummary(searchText);

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          content: searchText,
          user_id: userId,
          title,
          summary
        })
        .select()
        .single();

      if (jobError) throw jobError;
      
      const jobId = jobData.id;
      onJobCreated(jobId, searchText);

      const result = await processJobRequirements(searchText, searchType, companyName, userId);
      
      if (!result?.searchString) {
        throw new Error('Failed to generate search string');
      }

      const { error: updateError } = await supabase
        .from('jobs')
        .update({ search_string: result.searchString })
        .eq('id', jobId);

      if (updateError) throw updateError;

      setSearchString(result.searchString);
      toast.success("Search string generated successfully!");

    } catch (error) {
      console.error('Error processing content:', error);
      toast.error(error instanceof Error ? error.message : "Failed to process content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error("Invalid file type. Please upload a PDF file or an image");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

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
  };

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
