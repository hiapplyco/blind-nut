
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useJobEditor(jobId: string) {
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleSourceCandidates = async (analysisContent: string) => {
    // Instead of processing here, we'll navigate to the sourcing page
    // with the jobId, letting that page access the data directly
    navigate('/sourcing', { 
      state: { 
        jobId: Number(jobId),
        autoRun: true
      } 
    });
  };

  const handleCreateLinkedInPost = async (analysisContent: string) => {
    setIsPostLoading(true);
    try {
      // Process for LinkedIn post generation
      navigate('/linkedin-post', { 
        state: { 
          content: analysisContent,
          jobId: Number(jobId),
          autoRun: true
        } 
      });
    } catch (error) {
      console.error('Error creating LinkedIn post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create LinkedIn post',
        variant: 'destructive',
      });
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
    handleCreateLinkedInPost,
  };
}
