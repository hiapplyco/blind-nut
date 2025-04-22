
import { useState, useEffect } from "react";
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
  isLoading: boolean;
  error: string | null;
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
    isSubmitting: false,
    isLoading: !!jobId, // Set initial loading state to true if we're editing an existing job
    error: null
  });
  const navigate = useNavigate();
  const { session } = useAuth();

  // Fetch existing job data if editing
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
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
          setFormState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: "Job not found" 
          }));
          toast({
            title: "Error",
            description: "Job not found",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching job:", err);
        setFormState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred" 
        }));
      }
    };

    if (jobId) {
      fetchJob();
    } else {
      // Make sure we're not in loading state for new jobs
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  }, [jobId]);

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
      console.log("Updating existing job:", jobId);
      const { error: updateError } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", Number(jobId));

      if (updateError) throw updateError;
      return Number(jobId);
    } 

    console.log("Creating new job");
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
      
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ analysis: analysisData })
        .eq("id", newJobId);

      if (updateError) {
        throw updateError;
      }

      return analysisData;
    } catch (error) {
      console.error("Error during analysis:", error);
      // Return null instead of throwing to prevent job save failure
      return null;
    }
  };

  const handleSuccess = (newJobId: number, isUpdate: boolean, hasAnalysis: boolean) => {
    const successMessage = isUpdate ? "Job updated successfully" : "Job created successfully";
    const warningMessage = hasAnalysis ? "" : " (Analysis will be available soon)";
    
    toast({
      title: "Success",
      description: successMessage + warningMessage,
    });
    
    console.log("Navigating to editor page:", `/job-editor/${newJobId}`);
    
    // Call the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Navigate immediately to the editor page
    navigate(`/job-editor/${newJobId}`, { replace: true });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

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
        const analysisResult = await analyzeJobPosting(newJobId);
        hasAnalysis = !!analysisResult;
        if (!hasAnalysis) {
          console.warn("Analysis failed, but job was saved");
          toast({
            title: "Warning",
            description: "Job saved but analysis failed. You can try analyzing again later.",
            variant: "destructive",
          });
        }
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
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }));
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
