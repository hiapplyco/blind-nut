
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleContentChange = (value: string) => {
    setFormState(prev => ({ ...prev, content: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job posting",
        variant: "destructive",
      });
      return;
    }
    
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
      // First create the job with just the content
      const jobData = {
        content: formState.content,
        created_at: new Date().toISOString(),
        user_id: session.user.id,
        ...(jobId && { id: Number(jobId) })
      };

      let newJobId: number;
      
      if (jobId) {
        const { error: updateError } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", Number(jobId));

        if (updateError) throw updateError;
        newJobId = Number(jobId);
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("jobs")
          .insert(jobData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!insertData) throw new Error("No data returned from insert");
        
        newJobId = insertData.id;
      }

      console.log("Job created/updated with ID:", newJobId);

      // Then attempt to analyze it
      console.log("Analyzing job posting...");
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-schema', {
          body: { schema: formState.content }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        // Don't throw here, we'll update the job without analysis
        toast({
          title: "Warning",
          description: "Job saved but analysis failed. You can try analyzing again later.",
        });
      } else {
        console.log("Analysis completed:", analysisData);
        // Update the job with the analysis
        const { error: updateError } = await supabase
          .from("jobs")
          .update({ analysis: analysisData })
          .eq("id", newJobId);

        if (updateError) {
          console.error("Error updating job with analysis:", updateError);
        }
      }

      // Navigate to the editor page regardless of analysis success
      console.log("Navigating to editor page:", `/job-editor/${newJobId}`);
      toast({
        title: "Success",
        description: jobId ? "Job updated successfully" : "Job created successfully",
      });
      
      navigate(`/job-editor/${newJobId}`);
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
