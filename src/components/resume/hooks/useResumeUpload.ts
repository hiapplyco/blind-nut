
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

export const useResumeUpload = (jobId: number, userId: string) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId.toString());
      formData.append('userId', userId);

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: formData,
      });

      if (error) throw error;

      const queryClient = new QueryClient();
      await queryClient.invalidateQueries({ queryKey: ["resume-matches", jobId] });
      toast.success("Resume analyzed successfully!");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Error analyzing resume:', error);
      toast.error(`Failed to analyze resume: ${message}`);
    } finally {
      setIsUploading(false);
    }
  }, [jobId, userId]);

  return {
    isUploading,
    handleFileUpload
  };
};
