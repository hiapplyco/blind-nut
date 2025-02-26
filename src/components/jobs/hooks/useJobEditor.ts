
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { processJobRequirements } from '@/utils/jobRequirements';

export function useJobEditor(jobId: string) {
  const navigate = useNavigate();
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      console.log("Fetching job data for ID:", jobId);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', Number(jobId))
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        throw error;
      }
      
      console.log("Job data received:", data);
      return data;
    },
  });

  const handleSourceCandidates = async (editorContent: string) => {
    setIsSourceLoading(true);
    console.log("Processing content for sourcing:", editorContent);
    
    try {
      toast.info("Processing job requirements for sourcing...");
      const result = await processJobRequirements(editorContent, "candidates");
      
      if (result) {
        toast.success("Job requirements processed successfully!");
        navigate('/sourcing', { 
          replace: true,
          state: { processedRequirements: result }
        });
      }
    } catch (error) {
      console.error('Error processing job requirements:', error);
      toast.error("Failed to process job requirements");
    } finally {
      setIsSourceLoading(false);
    }
  };

  const handleCreateLinkedInPost = async (editorContent: string) => {
    setIsPostLoading(true);
    console.log("Generating LinkedIn post from content:", editorContent);
    
    try {
      toast.info("Generating LinkedIn post...");
      
      const { data, error } = await supabase.functions.invoke('generate-linkedin-post', {
        body: { content: editorContent }
      });

      if (error) throw error;
      
      toast.success("LinkedIn post generated successfully!");
      navigate('/linkedin-post-generator', { 
        replace: true,
        state: { generatedPost: data.post }
      });
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      toast.error("Failed to generate LinkedIn post");
    } finally {
      setIsPostLoading(false);
    }
  };

  return {
    job,
    isLoading,
    error,
    isSourceLoading,
    isPostLoading,
    handleSourceCandidates,
    handleCreateLinkedInPost
  };
}
