
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface UseJobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

interface FormState {
  content: string;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}

interface JobData {
  content: string;
  created_at: string;
  user_id: string;
  id?: number;
}

export function useJobPostingForm({ jobId, onSuccess, onError }: UseJobPostingFormProps) {
  const [formState, setFormState] = useState<FormState>({
    content: "",
    isSubmitting: false,
    isLoading: !!jobId, // Set initial loading state to true if we're editing an existing job
    error: null
  });
  const navigate = useNavigate();
  const { session } = useAuth();

  // Fetch existing job data if editing
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setFormState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      try {
        console.log("Fetching job with ID:", jobId);
        const { data, error } = await supabase
          .from("jobs")
          .select("content")
          .eq("id", Number(jobId))
          .single();

        if (error) {
          console.error("Error fetching job:", error);
          setFormState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: error.message 
          }));
          if (onError) onError(error.message);
          toast({
            title: "Error",
            description: `Failed to load job: ${error.message}`,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          console.log("Job data fetched successfully:", data);
          setFormState(prev => ({ 
            ...prev, 
            content: data.content || "",
            isLoading: false 
          }));
        } else {
          console.error("No job data found");
          const errorMessage = "Job not found";
          setFormState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: errorMessage
          }));
          if (onError) onError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching job:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setFormState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: errorMessage
        }));
        if (onError) onError(errorMessage);
      }
    };

    // Call fetchJob to load data (or set loading to false if no jobId)
    fetchJob();
  }, [jobId, onError]);

  const handleContentChange = (value: string) => {
    setFormState(prev => ({ ...prev, content: value }));
  };

  const validateSubmission = () => {
    if (!session?.user) {
      const errorMessage = "You must be logged in to create a job posting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (onError) onError(errorMessage);
      return false;
    }
    
    if (!formState.content.trim()) {
      const errorMessage = "Please enter job details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (onError) onError(errorMessage);
      return false;
    }

    return true;
  };

  const analyzeJobPosting = async (newJobId: number) => {
    console.log("Analyzing job posting...");
    try {
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-schema', {
          body: { schema: formState.content }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw analysisError;
      }

      console.log("Analysis completed:", analysisData);
      
      if (!analysisData) {
        console.warn("No analysis data returned");
        return null;
      }
      
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ analysis: analysisData })
        .eq("id", newJobId);

      if (updateError) {
        console.error("Error updating analysis:", updateError);
        throw updateError;
      }

      return analysisData;
    } catch (error) {
      console.error("Error during analysis:", error);
      // Return null instead of throwing to prevent job save failure
      return null;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      if (!session?.user?.id) {
        throw new Error("User ID not found");
      }

      const jobData = {
        content: formState.content,
        created_at: new Date().toISOString(),
        user_id: session.user.id,
      };

      // Create or update the job record
      const { data: jobResult, error: jobError } = await (jobId ? 
        supabase.from("jobs").update(jobData).eq("id", Number(jobId)).select('id').single() : 
        supabase.from("jobs").insert(jobData).select('id').single());

      if (jobError) throw jobError;
      if (!jobResult) throw new Error("No data returned from job creation/update");
      
      const newJobId = jobResult.id;
      console.log("Job created/updated with ID:", newJobId);

      // Analyze the job posting (but don't block on completion)
      let analysisResult = null;
      try {
        analysisResult = await analyzeJobPosting(newJobId);
      } catch (analysisError) {
        console.warn("Analysis failed, but job was saved:", analysisError);
      }

      // Show a success message
      toast({
        title: "Success",
        description: jobId ? "Job updated successfully" : "Job created successfully" + 
                   (!analysisResult ? " (Analysis will be available soon)" : ""),
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to the editor page
      console.log("Navigating to editor page:", `/job-editor/${newJobId}`);
      navigate(`/job-editor/${newJobId}`, { replace: true });

    } catch (error) {
      console.error("Error saving job:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save job posting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        error: errorMessage
      }));
      if (onError) onError(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    content: formState.content,
    setContent: handleContentChange,
    isSubmitting: formState.isSubmitting,
    isLoading: formState.isLoading,
    error: formState.error,
    onSubmit
  };
}
