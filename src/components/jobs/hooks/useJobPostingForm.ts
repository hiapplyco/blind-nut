
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

interface JobData {
  content: string;
  created_at: string;
  user_id: string;
  id?: number;
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

  const validateSubmission = () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job posting",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formState.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter job details",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const createOrUpdateJob = async (jobData: JobData) => {
    if (jobId) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", Number(jobId));

      if (updateError) throw updateError;
      return Number(jobId);
    } 

    const { data: insertData, error: insertError } = await supabase
      .from("jobs")
      .insert(jobData)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!insertData) throw new Error("No data returned from insert");
    
    return insertData.id;
  };

  const analyzeJobPosting = async (newJobId: number) => {
    console.log("Analyzing job posting...");
    const { data: analysisData, error: analysisError } = await supabase.functions
      .invoke('analyze-schema', {
        body: { schema: formState.content }
      });

    if (analysisError) {
      console.error("Analysis error:", analysisError);
      throw analysisError;
    }

    console.log("Analysis completed:", analysisData);
    
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ analysis: analysisData })
      .eq("id", newJobId);

    if (updateError) {
      throw updateError;
    }

    return analysisData;
  };

  const handleSuccess = (newJobId: number, isUpdate: boolean, hasAnalysis: boolean) => {
    const successMessage = isUpdate ? "Job updated successfully" : "Job created successfully";
    const warningMessage = hasAnalysis ? "" : " (Analysis will be available soon)";
    
    toast({
      title: "Success",
      description: successMessage + warningMessage,
    });
    
    console.log("Navigating to editor page:", `/job-editor/${newJobId}`);
    
    // Navigate immediately to the editor page
    navigate(`/job-editor/${newJobId}`, { replace: true });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const jobData = {
        content: formState.content,
        created_at: new Date().toISOString(),
        user_id: session.user.id,
        ...(jobId && { id: Number(jobId) })
      };

      const newJobId = await createOrUpdateJob(jobData);
      console.log("Job created/updated with ID:", newJobId);

      let hasAnalysis = false;
      try {
        await analyzeJobPosting(newJobId);
        hasAnalysis = true;
      } catch (analysisError) {
        console.error("Analysis failed, but job was saved:", analysisError);
        toast({
          title: "Warning",
          description: "Job saved but analysis failed. You can try analyzing again later.",
          variant: "destructive",
        });
      }

      handleSuccess(newJobId, !!jobId, hasAnalysis);

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

