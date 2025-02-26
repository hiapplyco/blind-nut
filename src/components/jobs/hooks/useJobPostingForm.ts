
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseJobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
}

interface FormState {
  content: string;
  isSubmitting: boolean;
}

export function useJobPostingForm({ jobId, onSuccess }: UseJobPostingFormProps) {
  const [formState, setFormState] = useState<FormState>({
    content: "",
    isSubmitting: false
  });

  const handleContentChange = (value: string) => {
    setFormState(prev => ({ ...prev, content: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter job details",
        variant: "destructive",
      });
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Call the analyze-schema function with the job content
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-schema', {
          body: { schema: formState.content }
        });

      if (analysisError) throw analysisError;

      // Create or update the job with both the content and analysis
      const jobData = {
        content: formState.content,
        analysis: analysisData,
        updated_at: new Date().toISOString(),
        // Convert jobId to number when used as database ID
        ...(jobId && { id: Number(jobId) })
      };

      if (jobId) {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", Number(jobId));

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(jobData);

        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Job posting created successfully",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job posting",
        variant: "destructive",
      });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    content: formState.content,
    setContent: handleContentChange,
    isSubmitting: formState.isSubmitting,
    onSubmit
  };
}
